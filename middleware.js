import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
    const token = await getToken({ req });
    const { pathname } = req.nextUrl;

    console.log("🔍 Middleware - Checking access for:", pathname);
    console.log("🔑 Token found:", !!token);

    // Allow public pages & API authentication routes
    if (pathname.startsWith("/api/auth") || pathname === "/complete-profile") {
        return NextResponse.next();
    }

    // If no token, redirect to sign-in page
    if (!token) {
        console.log("❌ No token found, redirecting to sign-in...");
        return NextResponse.redirect(new URL("/api/auth/signin", req.url));
    }

    // If profile is incomplete, force redirect to complete profile
    if (!token.isProfileComplete && pathname !== "/complete-profile") {
        console.log("⚠️ Profile incomplete, redirecting to complete-profile...");
        return NextResponse.redirect(new URL("/complete-profile", req.url));
    }

    // Allow access
    return NextResponse.next();
}

// Protect these routes
export const config = {
    matcher: ["/dashboard", "/panel", "/settings"], // Add more protected routes here
};
