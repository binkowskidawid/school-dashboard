import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { verifyPassword } from "~/utils/auth/password";
import { generateToken } from "~/utils/auth/jwt";
import { getUserProfile } from "~/utils/auth/getUserProfile";
import { type LoginCredentials } from "~/types/user";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LoginCredentials;
    const { username, password } = body;

    // INPUT VALIDATION
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 },
      );
    }

    // FIND USER AND INCLUDE THEIR PROFILE
    const userAuth = await db.userAuth.findUnique({
      where: { username },
      include: {
        adminProfile: true,
        teacherProfile: true,
        studentProfile: true,
        parentProfile: true,
      },
    });

    if (!userAuth) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // VERIFY PASSWORD
    const isValid = await verifyPassword(password, userAuth.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    // GET USER PROFILE BASED ON ROLE
    const profile = getUserProfile(userAuth);

    // CREATE USER OBJECT
    const user = {
      id: userAuth.id,
      username: userAuth.username,
      role: userAuth.role,
      name: profile?.name,
    };

    // GENERATE SINGLE JWT TOKEN
    const token = await generateToken({
      userId: userAuth.id,
      username: userAuth.username,
      role: userAuth.role,
    });

    // CREATE RESPONSE WITH USER DATA
    const response = NextResponse.json({ user }, { status: 200 });

    // SET SECURE HTTP-ONLY COOKIE
    response.cookies.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60, // 24 HOURS
      priority: "high",
    });

    // Also set a user cookie for client access
    response.cookies.set("user", JSON.stringify(user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60, // 24 HOURS
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}
