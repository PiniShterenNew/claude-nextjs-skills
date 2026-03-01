---
name: realtime-layer
description: "Implements real-time features in Next.js using WebSocket or Server-Sent Events (SSE). Covers connection management with exponential backoff reconnect, typed event system, optimistic updates, and React Query cache integration. Use when building live updates, push notifications, collaborative features, live dashboards, chat, activity feeds, or any feature where the server needs to push data to connected clients without polling."
allowed-tools: Read, WebFetch
---

# Realtime Layer

## Purpose
Implements real-time data push from server to client. Provides a typed event system,
a WebSocket hook with automatic reconnection, and patterns for integrating real-time
events with TanStack Query's cache so the UI stays in sync without polling.

## Architecture Decision

```
WebSocket  → bidirectional, best for chat, collaborative editing, cursor sync
SSE        → server-to-client only, simpler, works through HTTP/2, good for live feeds

For most Next.js apps: start with SSE.
Use WebSocket only when you need client-to-server messaging (chat, collab).
Note: Next.js Route Handlers support SSE natively.
      WebSocket requires a separate server process (not supported natively).
```

## Typed Event System

```typescript
// src/shared/types/realtime.ts
export type RealtimeEvent =
  | { type: 'PRODUCT_CREATED'; payload: Product }
  | { type: 'PRODUCT_UPDATED'; payload: { id: string; changes: Partial<Product> } }
  | { type: 'PRODUCT_DELETED'; payload: { id: string } }
  | { type: 'ORDER_STATUS_CHANGED'; payload: { id: string; status: OrderStatus } }
  | { type: 'NOTIFICATION'; payload: { message: string; level: 'info' | 'warning' | 'error' } }
```

## SSE Implementation (Recommended)

### Server — Route Handler
```typescript
// src/app/api/events/route.ts
import { NextRequest } from 'next/server'
import { auth } from '@/shared/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs' // SSE requires Node runtime, not Edge

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        )
      }

      // Send initial connection confirmation
      send('connected', { userId: session.user.id })

      // Subscribe to events for this user
      // (Implementation depends on your pub/sub: Redis, in-memory, etc.)
      const unsubscribe = subscribeToUserEvents(session.user.id, (event) => {
        send(event.type, event.payload)
      })

      // Keep alive ping every 30s
      const keepAlive = setInterval(() => {
        send('ping', { t: Date.now() })
      }, 30_000)

      // Clean up when client disconnects
      request.signal.addEventListener('abort', () => {
        clearInterval(keepAlive)
        unsubscribe()
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  })
}
```

### Client — SSE Hook
```typescript
// src/shared/hooks/useSSE.ts
'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { RealtimeEvent } from '@/shared/types/realtime'

interface UseSSEOptions {
  onEvent: (event: RealtimeEvent) => void
  onError?: (error: Event) => void
  enabled?: boolean
}

export function useSSE({ onEvent, onError, enabled = true }: UseSSEOptions) {
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectAttempts = useRef(0)
  const MAX_RECONNECT = 5
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const connect = useCallback(() => {
    if (!enabled) return

    const es = new EventSource('/api/events')
    eventSourceRef.current = es

    es.addEventListener('open', () => {
      reconnectAttempts.current = 0
    })

    // Listen to all typed events
    const eventTypes: RealtimeEvent['type'][] = [
      'PRODUCT_CREATED', 'PRODUCT_UPDATED', 'PRODUCT_DELETED',
      'ORDER_STATUS_CHANGED', 'NOTIFICATION',
    ]

    eventTypes.forEach((type) => {
      es.addEventListener(type, (e: MessageEvent) => {
        onEvent({ type, payload: JSON.parse(e.data) } as RealtimeEvent)
      })
    })

    es.addEventListener('error', (e) => {
      onError?.(e)
      es.close()
      eventSourceRef.current = null

      if (reconnectAttempts.current < MAX_RECONNECT) {
        const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30_000)
        reconnectAttempts.current++
        reconnectTimer.current = setTimeout(connect, delay)
      }
    })
  }, [enabled, onEvent, onError])

  useEffect(() => {
    connect()
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      eventSourceRef.current?.close()
    }
  }, [connect])
}
```

## WebSocket Implementation

### Client Hook with Reconnect
```typescript
// src/shared/hooks/useWebSocket.ts
'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { RealtimeEvent } from '@/shared/types/realtime'
import { productQueries } from '@/features/products/hooks/useProductQuery'

export function useProductsRealtime() {
  const queryClient = useQueryClient()
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttempts = useRef(0)
  const MAX_ATTEMPTS = 5

  const handleEvent = useCallback(
    (event: RealtimeEvent) => {
      switch (event.type) {
        case 'PRODUCT_CREATED':
        case 'PRODUCT_DELETED':
          // Invalidate all list queries — simple and correct
          queryClient.invalidateQueries({ queryKey: productQueries.lists() })
          break

        case 'PRODUCT_UPDATED':
          // Surgically update the detail cache without a re-fetch
          queryClient.setQueryData(
            productQueries.detail(event.payload.id),
            (old: ApiResponse<Product> | undefined) => {
              if (!old?.success) return old
              return { ...old, data: { ...old.data, ...event.payload.changes } }
            }
          )
          // Also invalidate lists in case display values changed
          queryClient.invalidateQueries({ queryKey: productQueries.lists() })
          break
      }
    },
    [queryClient]
  )

  const connect = useCallback(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL
    if (!wsUrl) return

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      reconnectAttempts.current = 0
      ws.send(JSON.stringify({ type: 'SUBSCRIBE', channel: 'products' }))
    }

    ws.onmessage = ({ data }) => {
      try {
        const event: RealtimeEvent = JSON.parse(data)
        handleEvent(event)
      } catch {
        console.warn('[WS] Failed to parse message:', data)
      }
    }

    ws.onclose = () => {
      wsRef.current = null
      if (reconnectAttempts.current < MAX_ATTEMPTS) {
        const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30_000)
        reconnectAttempts.current++
        setTimeout(connect, delay)
      }
    }

    ws.onerror = (e) => {
      console.error('[WS] Error:', e)
      ws.close()
    }
  }, [handleEvent])

  useEffect(() => {
    connect()
    return () => {
      wsRef.current?.close()
    }
  }, [connect])
}
```

### Usage in a Feature Component
```typescript
// src/features/products/components/ProductsPage.tsx
'use client'

import { useProductsRealtime } from '@/shared/hooks/useWebSocket'
import { useProductList } from '../hooks/useProductQuery'

function ProductsPage() {
  // Subscribe to real-time updates — cache invalidation is automatic
  useProductsRealtime()

  const { data, isPending } = useProductList({ page: 1 })
  // data auto-updates when WS events arrive and invalidate queries

  return <div>{/* render list */}</div>
}
```

## Anti-Patterns

| ❌ Never | ✅ Instead | Why |
|----------|------------|-----|
| Polling with setInterval | SSE or WebSocket | Wastes bandwidth, delayed updates |
| Store WS data in Zustand | Invalidate TanStack Query | Single source of truth |
| Reconnect without backoff | Exponential backoff (max 30s) | Server overload on reconnect |
| Skip cleanup in useEffect | Always close in return fn | Memory leaks |
| WebSocket in Route Handler | Separate Node.js server | Next.js doesn't support WS upgrade |

## Quality Checklist
- [ ] Event types are discriminated union (type-safe)
- [ ] Reconnect logic has exponential backoff (max 30s)
- [ ] Cleanup runs on component unmount
- [ ] WS/SSE events invalidate TanStack Query — not stored in Zustand
- [ ] `NEXT_PUBLIC_WS_URL` env var set and validated in `env.ts`
- [ ] `npm run typecheck` passes

## Related Skills
- `state-architect`: TanStack Query cache is the target of WS invalidations
- `env-config`: `NEXT_PUBLIC_WS_URL` needs type-safe validation
- `auth-flow`: Real-time connections should verify session on connect
