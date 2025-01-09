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

    // Input validation
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Find user and include their profile
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
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, userAuth.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Get user profile based on role
    const profile = getUserProfile(userAuth);

    // Create user object (excluding sensitive data)
    const user = {
      id: userAuth.id,
      username: userAuth.username,
      role: userAuth.role,
      ...profile,
    };

    // Generate single JWT token
    const token = generateToken({
      userId: userAuth.id,
      username: userAuth.username,
      role: userAuth.role,
    });

    // Create response with user data
    const response = NextResponse.json({ user }, { status: 200 });

    // Set secure HTTP-only cookie
    response.cookies.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
