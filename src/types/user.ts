import {
  type Admin,
  type Parent,
  type Student,
  type Teacher,
  type UserRole,
} from "@prisma/client";

export interface BaseUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
}

// UNION TYPE OF ALL POSSIBLE USER TYPES
export type User = Admin | Teacher | Student | Parent;

// LOGIN CREDENTIALS TYPE
export interface LoginCredentials {
  username: string;
  password: string;
}

// TYPE GUARD FUNCTIONS TO CHECK USER TYPES
export function isAdmin(user: User): user is Admin {
  return user.role === "ADMIN";
}

export function isTeacher(user: User): user is Teacher {
  return user.role === "TEACHER";
}

export function isStudent(user: User): user is Student {
  return user.role === "STUDENT";
}

export function isParent(user: User): user is Parent {
  return user.role === "PARENT";
}
