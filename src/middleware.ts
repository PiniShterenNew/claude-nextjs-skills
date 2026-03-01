import { auth } from '@/shared/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default auth((req: NextRequest & { auth: { user?: { id?: string } } | null }) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  const isAuthenticated = !!session?.user?.id

  // Auth routes: redirect authenticated users away
  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/verify-email')

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Protected workspace routes: redirect unauthenticated users to login
  const isWorkspaceRoute = /^\/[^/]+\/(dashboard|ingredients|recipes|menu-engineering|settings)/.test(pathname)
  if (isWorkspaceRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (images, etc.)
     * - api/auth (NextAuth handlers)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/auth).*)',
  ],
}
