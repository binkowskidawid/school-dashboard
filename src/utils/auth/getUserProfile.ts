import type {Prisma} from "@prisma/client";

/**
 * Type representing a UserAuth record with all possible profile relationships loaded.
 * This matches the Prisma query that includes all profile types (admin, teacher, student, parent).
 */
type UserAuthWithProfile = Prisma.UserAuthGetPayload<{
  include: {
    adminProfile: true;
    teacherProfile: true;
    studentProfile: true;
    parentProfile: true;
  };
}>;

/**
 * Returns the appropriate profile object based on the user's role.
 * This function helps map a user authentication record to their specific profile type.
 * @param {UserAuthWithProfile} userAuth - The user auth record with loaded profile relationships
 * @returns {Object} The corresponding profile object (admin, teacher, student, or parent)
 * @throws {Error} If the user role is invalid or unrecognized
 * @example
 * const profile = getUserProfile(userAuth);
 * console.log(profile.name); // Accessing profile data
 */
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
