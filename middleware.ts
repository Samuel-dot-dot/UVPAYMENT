export { default } from 'next-auth/middleware';

// Protect all routes under (protected) group
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/videos/:path*',
    '/pricing/:path*',
    '/profile/:path*',
    '/upload/:path*',
    '/admin/:path*',
  ],
};
