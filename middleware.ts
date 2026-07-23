import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request)
  const path = request.nextUrl.pathname

  // Redirigir a login si no hay sesión y no está en login
  if (!user && path !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    const role = user.user_metadata?.role

    // Redirigir según rol
    if (path.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/local', request.url))
    }
    if (path.startsWith('/local') && role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    // Redirigir raíz según rol
    if (path === '/') {
      if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url))
      else return NextResponse.redirect(new URL('/local', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
}
