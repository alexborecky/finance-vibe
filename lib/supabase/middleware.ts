import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
        return supabaseResponse
    }

    const supabase = createServerClient(
        url,
        key,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh session if expired - required for Server Components
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protected routes
    const protectedPaths = ['/dashboard', '/goals', '/expenses', '/savings', '/income', '/admin']
    const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))

    // Auth routes (should redirect to dashboard if already logged in)
    const authPaths = ['/', '/auth/login', '/auth/signup']
    const isAuthPath = authPaths.some(path =>
        path === '/'
            ? request.nextUrl.pathname === '/'
            : request.nextUrl.pathname.startsWith(path)
    )

    if (isProtectedPath && !user) {
        // Redirect to login if accessing protected route without auth
        const url = request.nextUrl.clone()
        url.pathname = '/auth/login'
        url.searchParams.set('redirect', request.nextUrl.pathname)
        return NextResponse.redirect(url)
    }

    if (isAuthPath && user) {
        // Redirect to dashboard if already logged in
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
