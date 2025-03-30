import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export { default } from 'next-auth/middleware';

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });
    const url = request.nextUrl;

    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (token && ['/sign-in', '/sign-up', '/verify', '/'].includes(url.pathname)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If user is NOT authenticated and trying to access the dashboard, redirect to sign-in
    if (!token && url.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    return NextResponse.next(); // Allow request to proceed if no redirects are needed
}

export const config = {
    matcher: [
        '/sign-in',
        '/sign-up',
        '/',
        '/dashboard/:path*',
        '/verify/:path*'
    ]
};


