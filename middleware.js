import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = req.nextUrl;

    console.log("🔍 Middleware - Checking:", pathname);
    console.log("🔑 Token:", !!token);

    // Allow public and auth-related routes
    if (pathname.startsWith("/api/auth") || pathname === "/signin" || pathname === "/complete-profile") {
        return NextResponse.next();
    }

    // Protect all routes under /panel, /dashboard, /profile, /settings
    if (pathname.startsWith("/panel") || pathname.startsWith("/dashboard") || pathname.startsWith("/profile") || pathname.startsWith("/settings")) {
        if (!token) {
            console.log("❌ No token, redirecting to signin...");
            const url = new URL("/signin", req.url);
            url.searchParams.set("callbackUrl", encodeURIComponent(req.url));
            return NextResponse.redirect(url);
        }

        if (token && !token.isProfileComplete && pathname !== "/complete-profile") {
            console.log("⚠️ Profile incomplete, redirecting to complete-profile...");
            const url = new URL("/complete-profile", req.url);
            url.searchParams.set("callbackUrl", encodeURIComponent("/")); // Force callback to homepage
            return NextResponse.redirect(url);
        }
    }

    // Allow unmatched routes to proceed (Next.js will handle 404)
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};