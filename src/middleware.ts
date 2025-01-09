import { type NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./utils/auth/jwt";
import { type User } from "~/types/user";
import {
  PROTECTED_ROLES,
  isPublicRoute,
  isProtectedRoute,
  getRoleBasedRoute
} from "~/utils/auth/authUtils";

const CONFIG = {
  publicFiles: ["/_next", "/api/", "/favicon", "."],
} as const;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public files and API routes (except auth endpoints)
  if (CONFIG.publicFiles.some(file => pathname.startsWith(file))) {
    if (!pathname.startsWith("/api/auth/")) {
      return NextResponse.next();
    }
  }

  // STEP 1: Get authentication state
  const accessToken = request.cookies.get("accessToken")?.value;
  const userCookie = request.cookies.get("user")?.value;

  // Handle root path
  if (pathname === "/") {
    if (!accessToken || !userCookie) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    try {
      const user = JSON.parse(userCookie) as User;
      return NextResponse.redirect(
        new URL(getRoleBasedRoute(user.role), request.url)
      );
    } catch {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  // STEP 2: Determine authentication status
  const isAuthenticated = !!(accessToken && userCookie);
  const isPublic = isPublicRoute(pathname);

  // STEP 3: Handle authentication flows
  if (!isAuthenticated && !isPublic) {
    // Unauthenticated user trying to access protected route
    console.log("Unauthenticated access attempt:", pathname);
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (isAuthenticated && isPublic) {
    try {
      // Verify both token and user data
      const tokenPayload = verifyToken(accessToken);
      const user = JSON.parse(userCookie) as User;

      // Verify token and user cookie match
      if (tokenPayload.role !== user.role) {
        throw new Error("Token and user cookie mismatch");
      }

      // Redirect to appropriate dashboard
      const targetRoute = getRoleBasedRoute(user.role);
      return NextResponse.redirect(new URL(targetRoute, request.url));
    } catch (error) {
      // Invalid or mismatched tokens - clear everything and return to sign-in
      console.error("Auth token verification failed:", error);
      const response = NextResponse.redirect(new URL("/sign-in", request.url));
      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");
      response.cookies.delete("user");
      return response;
    }
  }

  // STEP 4: Handle role-based access for authenticated users
  if (isAuthenticated && isProtectedRoute(pathname)) {
    try {
      const tokenPayload = verifyToken(accessToken);
      const user = JSON.parse(userCookie) as User;
      const userRole = user.role;

      // Verify the user is accessing their correct role path
      const firstPathSegment = pathname.split("/")[1]?.toUpperCase();
      if (
        PROTECTED_ROLES.includes(firstPathSegment as typeof PROTECTED_ROLES[number]) &&
        firstPathSegment !== userRole
      ) {
        console.log(
          `Role mismatch - redirecting from ${firstPathSegment} to ${userRole}`,
        );
        return NextResponse.redirect(
          new URL(getRoleBasedRoute(userRole), request.url)
        );
      }

      // Add user info to headers for backend use
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("X-User-Id", tokenPayload.userId);
      requestHeaders.set("X-User-Role", tokenPayload.role);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      // Token validation failed - clear tokens and redirect
      console.error("Token validation error:", error);
      const response = NextResponse.redirect(new URL("/sign-in", request.url));
      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");
      response.cookies.delete("user");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
