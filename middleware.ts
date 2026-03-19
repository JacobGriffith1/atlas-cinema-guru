import { NextResponse } from "next/server"
import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth

  const { pathname } = req.nextUrl
  const isAuthRoute = pathname.startsWith("/api/auth")
  const isLoginPage = pathname === "/login"
  const isPublicAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots") ||
    pathname.startsWith("/sitemap")

  // Keep seed accessible for now (Step 0). We'll lock it down later.
  const isSeed = pathname === "/api/seed"

  if (isAuthRoute || isLoginPage || isPublicAsset || isSeed) {
    return NextResponse.next()
  }

  if (!isLoggedIn) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
}
