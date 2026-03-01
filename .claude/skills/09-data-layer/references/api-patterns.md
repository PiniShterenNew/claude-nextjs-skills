# API Patterns Reference

## Cursor-Based Pagination

```typescript
// Better performance than offset pagination for large datasets
export async function fetchProductsCursor(
  cursor?: string,
  limit = 20
): Promise<ApiResponse<{ items: Product[]; nextCursor: string | null }>> {
  try {
    const items = await db.product.findMany({
      where: { deletedAt: null },
      take: limit + 1, // take one extra to determine if there's a next page
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: 'desc' },
    })

    let nextCursor: string | null = null
    if (items.length > limit) {
      const nextItem = items.pop()
      nextCursor = nextItem!.id
    }

    return { success: true, data: { items: items as Product[], nextCursor } }
  } catch (e) {
    console.error('[fetchProductsCursor]', e)
    return { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch' } }
  }
}
```

## File Upload (Route Handler)

```typescript
// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/shared/lib/auth'
import { put } from '@vercel/blob' // or your storage provider

const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
  }

  try {
    const blob = await put(`uploads/${session.user.id}/${file.name}`, file, {
      access: 'public',
    })
    return NextResponse.json({ success: true, url: blob.url })
  } catch (e) {
    console.error('[upload]', e)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
```

## Webhook Handler (with signature verification)

```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { db } from '@/shared/lib/prisma'
import { env } from '@/shared/lib/env'

const stripe = new Stripe(env.STRIPE_SECRET_KEY)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET)
  } catch (e) {
    console.error('[Stripe webhook] Invalid signature', e)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await db.order.update({
          where: { stripePaymentIntentId: paymentIntent.id },
          data: { status: 'PAID', paidAt: new Date() },
        })
        break
      }
      case 'payment_intent.payment_failed': {
        // handle failure
        break
      }
    }
    return NextResponse.json({ received: true })
  } catch (e) {
    console.error('[Stripe webhook] Handler error', e)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

// IMPORTANT: Stripe sends raw body — must disable body parsing
export const config = { api: { bodyParser: false } }
```

## SSE Streaming Response

```typescript
// app/api/stream/route.ts
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        // Simulate streaming events
        for await (const event of getEventStream()) {
          if (request.signal.aborted) break
          send(event)
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
```

## Batch Operations

```typescript
// Server Action for bulk operations
export async function bulkDeleteProductsAction(
  ids: unknown
): Promise<ApiResponse<{ deletedCount: number }>> {
  const session = await auth()
  if (!session?.user) return { success: false, error: API_ERRORS.UNAUTHORIZED }

  const parsed = z.array(z.string().cuid()).min(1).max(100).safeParse(ids)
  if (!parsed.success) {
    return { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid IDs' } }
  }

  try {
    const result = await db.product.updateMany({
      where: {
        id: { in: parsed.data },
        createdById: session.user.id,
        deletedAt: null,
      },
      data: { deletedAt: new Date() },
    })

    return { success: true, data: { deletedCount: result.count } }
  } catch (e) {
    console.error('[bulkDeleteProducts]', e)
    return { success: false, error: API_ERRORS.INTERNAL }
  }
}
```

## External API Call (with retry)

```typescript
// src/shared/lib/fetchWithRetry.ts
export async function fetchWithRetry<T>(
  url: string,
  options: RequestInit & { retries?: number } = {}
): Promise<T> {
  const { retries = 3, ...fetchOptions } = options
  let lastError: Error | undefined

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, fetchOptions)
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      return res.json() as Promise<T>
    } catch (e) {
      lastError = e as Error
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 2 ** attempt * 1000))
      }
    }
  }

  throw lastError
}
```
