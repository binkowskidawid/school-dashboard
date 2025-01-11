import {type NextRequest, NextResponse} from "next/server";
import {verifyToken} from "./utils/auth/jwt";
import type {User} from "~/types/user";

/**
 * Configuration constants for route handling and authentication
 * @constant
 */
const PUBLIC_PATHS = ["/sign-in", "/sign-in/"];
const ROOT_PATH = "/";
const PUBLIC_FILES = [
  "/_next",
  "/api/",
  "/favicon.ico",
  "/images/",
  "/public/",
] as const;

/**
 * Mapping of user roles to their respective dashboard paths
 * @constant
 */
const ROLE_PATHS = {
  ADMIN: "/admin",
  TEACHER: "/teacher",
  STUDENT: "/student",
  PARENT: "/parent",
} as const;

/**
 * Authentication and routing middleware for the school dashboard.
 * Handles user authentication, role-based access control, and routing logic.
 * @async
 * @param {NextRequest} request - The incoming request object
 * @returns {Promise<NextResponse>} The response with appropriate routing/authentication
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  try {
    const { pathname } = request.nextUrl;

    // Skip middleware for public files and API routes
    if (PUBLIC_FILES.some((path) => pathname.startsWith(path))) {
      return NextResponse.next();
    }

    // Get authentication state from cookies with detailed logging
    const authToken = request.cookies.get("authToken")?.value;
    const userCookie = request.cookies.get("user")?.value;

    console.log("Authentication state:", {
      path: pathname,
      hasAuthToken: !!authToken,
      hasUserCookie: !!userCookie,
      authTokenPreview: authToken ? `${authToken.substring(0, 20)}...` : null,
      userCookiePreview: userCookie
        ? `${userCookie.substring(0, 20)}...`
        : null,
    });

    // Early return if we don't have both cookies
    if (!authToken || !userCookie) {
      console.log("Missing required cookies");
      return handleUnauthenticated(request);
    }

    // Try to parse user cookie first
    let user: User;
    try {
      user = JSON.parse(userCookie) as User;
    } catch (error) {
      console.error("Failed to parse user cookie:", error);
      return clearAuthAndRedirect(request);
    }

    try {
      // Try to verify the current token
      await verifyToken(authToken);
    } catch (error) {
      console.error("Token verification failed, attempting refresh");

      // Token is invalid, try to refresh it
      const response = await fetch(new URL("/api/auth/refresh", request.url), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        return clearAuthAndRedirect(request);
      }

      // Get the new token from response
      const { token } = (await response.json()) as { token: string };
      const newResponse = NextResponse.redirect(request.url);

      // Set the new access token
      newResponse.cookies.set("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 24 * 60 * 60,
      });

      return newResponse;
    }

    // Handle various routing scenarios based on authentication state
    const isPublicRoute = PUBLIC_PATHS.includes(pathname);
    const isRootPath = pathname === ROOT_PATH;
    const userRole = user.role.toLowerCase();

    if (isRootPath || isPublicRoute) {
      const rolePath =
        ROLE_PATHS[user.role.toUpperCase() as keyof typeof ROLE_PATHS];
      return NextResponse.redirect(new URL(rolePath, request.url));
    }

    // Enforce role-based path restrictions
    const firstPathSegment = pathname.split("/")[1];
    if (
      firstPathSegment &&
      Object.values(ROLE_PATHS).some((path) =>
        path.includes(firstPathSegment),
      ) &&
      firstPathSegment !== userRole
    ) {
      return NextResponse.redirect(new URL(`/${userRole}`, request.url));
    }

    // Add user context to request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("X-User-Id", user.id);
    requestHeaders.set("X-User-Role", user.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error("Unexpected middleware error:", error);
    return clearAuthAndRedirect(request);
  }
}

/**
 * Handles requests from unauthenticated users, redirecting to sign-in
 * @param {NextRequest} request - The incoming request
 * @returns {NextResponse} Redirect to sign-in or allow if already on sign-in
 */
function handleUnauthenticated(request: NextRequest) {
  if (request.nextUrl.pathname === "/sign-in") {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL("/sign-in", request.url));
}

/**
 * Clears authentication cookies and redirects to sign-in page
 * @param {NextRequest} request - The incoming request
 * @returns {NextResponse} Response with cleared cookies and redirect
 */
function clearAuthAndRedirect(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/sign-in", request.url));
  response.cookies.delete("authToken");
  response.cookies.delete("user");
  return response;
}

/**
 * Middleware configuration specifying which routes to handle
 * Excludes static files and includes auth endpoints
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|images/|favicon.ico|public/).*)",
    "/api/auth/me",
  ],
};
