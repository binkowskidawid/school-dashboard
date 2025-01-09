import type { Prisma } from "@prisma/client";

type UserAuthWithProfile = Prisma.UserAuthGetPayload<{
  include: {
    adminProfile: true;
    teacherProfile: true;
    studentProfile: true;
    parentProfile: true;
  };
}>;

export function getUserProfile(userAuth: UserAuthWithProfile) {
  switch (userAuth.role) {
    case "ADMIN":
      return userAuth.adminProfile;
    case "TEACHER":
      return userAuth.teacherProfile;
    case "STUDENT":
      return userAuth.studentProfile;
    case "PARENT":
      return userAuth.parentProfile;
    default:
      throw new Error("Invalid user role");
  }
}
