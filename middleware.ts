import { withAuth } from "next-auth/middleware"

export default withAuth(
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/forms/:path*",
    "/analytics/:path*",
    "/vault/:path*",
    "/inspections/:path*",
    "/team/:path*",
    "/lifecycle/:path*",
    "/settings/:path*",
    // Add other protected routes here
  ]
}