import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = req.nextUrl;

    console.log("🔍 Middleware - Checking:", pathname);
    console.log("🔑 Token exists:", !!token);
    console.log("🔑 Token role:", token?.role);

    // Allow public and auth-related routes
    if (pathname.startsWith("/api/auth") || pathname === "/signin" || pathname === "/complete-profile") {
        return NextResponse.next();
    }

    // Protect all routes under /panel, /dashboard, /settings
    if (pathname.startsWith("/panel") || pathname.startsWith("/dashboard") || pathname.startsWith("/settings")) {
        if (!token) {
            console.log("❌ No token, redirecting to signin...");
            const url = new URL("/signin", req.url);
            url.searchParams.set("callbackUrl", encodeURIComponent(req.url));
            return NextResponse.redirect(url);
        }

        if (token && !token.isProfileComplete && pathname !== "/complete-profile") {
            console.log("⚠️ Profile incomplete, redirecting to complete-profile...");
            const url = new URL("/complete-profile", req.url);
            url.searchParams.set("callbackUrl", encodeURIComponent("/"));
            return NextResponse.redirect(url);
        }
    }

    // Special protection for personnel panel - requires admin role
    if (pathname.startsWith("/personnel")) {
        if (!token) {
            console.log("❌ No token, redirecting to signin...");
            const url = new URL("/signin", req.url);
            url.searchParams.set("callbackUrl", encodeURIComponent(req.url));
            return NextResponse.redirect(url);
        }

        const allowedRoles = ['admin'];
        if (!token.role || !allowedRoles.includes(token.role)) {
            const urlParams = new URLSearchParams(req.url.split("?")[1]);
            if (!urlParams.get("unauthorized")) { // Prevent redirect loop
                console.log("🚫 Unauthorized role detected for user:", token.email);
                console.log("🚫 Current role:", token.role);
                console.log("🚫 Redirecting to personnel page with unauthorized flag...");
                const url = new URL("/personnel", req.url);
                url.searchParams.set("unauthorized", "true");
                return NextResponse.redirect(url);
            }
        }

        if (token && !token.isProfileComplete && pathname !== "/complete-profile") {
            console.log("⚠️ Profile incomplete, redirecting to complete-profile...");
            const url = new URL("/complete-profile", req.url);
            url.searchParams.set("callbackUrl", encodeURIComponent("/"));
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};