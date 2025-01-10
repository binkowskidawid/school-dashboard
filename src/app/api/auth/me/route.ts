import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "~/server/db";
import { verifyToken } from "~/utils/auth/jwt";
import { getUserProfile } from "~/utils/auth/getUserProfile";

export async function GET() {
  try {
    // GET THE ACCESS TOKEN FROM COOKIES
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("authToken")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token is required" },
        { status: 401 },
      );
    }

    // VERIFY THE ACCESS TOKEN AND GET USER INFORMATION
    const payload = await verifyToken(accessToken);

    // FETCH THE USER'S DATA FROM DATABASE
    const userAuth = await db.userAuth.findUnique({
      where: { id: payload.userId },
      include: {
        adminProfile: true,
        teacherProfile: true,
        studentProfile: true,
        parentProfile: true,
      },
    });

    if (!userAuth) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // GET THE APPROPRIATE PROFILE BASED ON ROLE
    const profile = getUserProfile(userAuth);

    // REMOVE SENSITIVE INFORMATION
    const userData = {
      id: userAuth.id,
      username: userAuth.username,
      role: userAuth.role,
      password: null,
      ...profile,
    };

    return NextResponse.json({ user: userData }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Failed to authenticate user" },
      { status: 401 },
    );
  }
}
