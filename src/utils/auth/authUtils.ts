import { type UserRole } from "@prisma/client";

export const PROTECTED_ROLES = ["ADMIN", "TEACHER", "STUDENT", "PARENT"] as const;

export const ROLE_ROUTES = {
  ADMIN: "/admin",
  TEACHER: "/teacher",
  STUDENT: "/student",
  PARENT: "/parent",
} as const;

export const PUBLIC_ROUTES = ["/sign-in", "/"] as const;

export function getRoleBasedRoute(role: UserRole): string {
  return ROLE_ROUTES[role] ?? "/sign-in";
}

export function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some((route) => path === route || path === `${route}/`);
}

export function isProtectedRoute(path: string): boolean {
  const firstSegment = path.split("/")[1];
  return PROTECTED_ROLES.some((role) =>
    firstSegment?.toLowerCase() === role.toLowerCase()
  );
}

export function hasAccess(userRole: UserRole, path: string): boolean {
  const firstSegment = path.split("/")[1];
  return firstSegment?.toLowerCase() === userRole.toLowerCase();
}
