import { type NextRequest, NextResponse } from "next/server";
import { type User } from "./types/user"; // Define all variations of the sign-in path to handle trailing slashes

// Define all variations of the sign-in path to handle trailing slashes
const PUBLIC_PATHS = ["/sign-in", "/sign-in/"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Normalize the path by removing trailing slash
  const normalizedPath = pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;

  // Skip middleware for public files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.includes("/favicon") ||
    pathname.includes(".") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  const userCookie = request.cookies.get("user");
  const isAuthenticated = !!userCookie;
  const isPublicRoute = PUBLIC_PATHS.includes(pathname);

  // If user is not authenticated and tries to access a protected route
  if (!isAuthenticated && !isPublicRoute) {
    const url = new URL("/sign-in", request.url);
    return NextResponse.redirect(url);
  }

  // If user is authenticated and tries to access public routes
  if (isAuthenticated && isPublicRoute) {
    try {
      const user = JSON.parse(userCookie.value) as User;
      const rolePath = `/${user.role.toLowerCase()}`;
      const url = new URL(rolePath, request.url);
      return NextResponse.redirect(url);
    } catch (error) {
      // If there's an error parsing the user cookie, clear it and redirect to sign-in
      const response = NextResponse.redirect(new URL("/sign-in", request.url));
      response.cookies.delete("user");
      return response;
    }
  }

  // If user is authenticated and accessing role-specific routes
  if (isAuthenticated && !isPublicRoute) {
    try {
      const user = JSON.parse(userCookie.value) as User;
      const userRole = user.role.toLowerCase();
      const firstPathSegment = normalizedPath.split("/")[1];

      // If user tries to access a different role's route
      if (
        ["admin", "teacher", "student", "parent"].includes(
          firstPathSegment ?? "",
        ) &&
        firstPathSegment !== userRole
      ) {
        const url = new URL(`/${userRole}`, request.url);
        return NextResponse.redirect(url);
      }
    } catch (error) {
      // Handle invalid user cookie
      const response = NextResponse.redirect(new URL("/sign-in", request.url));
      response.cookies.delete("user");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
