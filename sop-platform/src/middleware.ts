import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/templates/:path*',
    '/api/submissions/:path*',
    '/api/users/:path*',
    '/api/reports/:path*',
    '/api/notifications/:path*',
    '/api/drafts/:path*',
    '/api/projects/:path*',
    '/api/project-sops/:path*',
    '/api/my-tasks/:path*',
    '/api/notifications-list/:path*',
    '/api/submissions-list/:path*',
  ],
}
