import { type NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./utils/auth/jwt";

// Configuration
const PUBLIC_PATHS = ["/sign-in", "/sign-in/"];
const PUBLIC_FILES = ["/_next", "/api/", "/favicon.ico"];

const ROLE_PATHS = {
  ADMIN: "/admin",
  TEACHER: "/teacher",
  STUDENT: "/student",
  PARENT: "/parent",
} as const;

/**
 * Middleware to handle authentication and authorization
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public files
  if (PUBLIC_FILES.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get auth token from cookies
  const authToken = request.cookies.get("authToken")?.value;

  // Handle public routes
  if (PUBLIC_PATHS.includes(pathname)) {
    // If user is authenticated, redirect to their dashboard
    if (authToken) {
      try {
        const payload = verifyToken(authToken);
        const rolePath = ROLE_PATHS[payload.role.toUpperCase() as keyof typeof ROLE_PATHS];
        return NextResponse.redirect(new URL(rolePath, request.url));
      } catch {
        // If token is invalid, clear it and continue to public route
        const response = NextResponse.next();
        response.cookies.delete("authToken");
        return response;
      }
    }
    return NextResponse.next();
  }

  // Handle protected routes
  if (!authToken) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  try {
    const payload = verifyToken(authToken);
    const userRole = payload.role.toLowerCase();
    const firstPathSegment = pathname.split("/")[1];

    // Ensure user is accessing their correct role path
    if (Object.values(ROLE_PATHS).some(path => path.includes(firstPathSegment ?? "")) &&
      firstPathSegment !== userRole) {
      return NextResponse.redirect(new URL(`/${userRole}`, request.url));
    }

    // Add user info to headers for backend use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("X-User-Id", payload.userId);
    requestHeaders.set("X-User-Role", payload.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch {
    // Invalid token - redirect to login
    const response = NextResponse.redirect(new URL("/sign-in", request.url));
    response.cookies.delete("authToken");
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
