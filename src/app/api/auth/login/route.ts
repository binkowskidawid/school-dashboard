import { NextResponse } from "next/server";
import { db } from "~/server/db";
import errorMessage from "~/utils/errorMessage";
import { verifyPassword } from "~/utils/auth/password";
import { getUserProfile } from "~/utils/auth/getUserProfile";
import { generateAccessToken, generateRefreshToken } from "~/utils/auth/jwt";
import {type LoginCredentials} from "~/types/user";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginCredentials;
    const userAgent = request.headers.get("user-agent");

    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 },
      );
    }

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

    const isValid = await verifyPassword(password, userAuth.password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const profile = getUserProfile(userAuth);

    // Create the user object without sensitive data
    const userForResponse = {
      id: userAuth.id,
      username: userAuth.username,
      role: userAuth.role,
      ...profile,
    };

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: userAuth.id,
      username: userAuth.username,
      role: userAuth.role,
    });

    const refreshToken = generateRefreshToken({
      userId: userAuth.id,
      username: userAuth.username,
      role: userAuth.role,
    });

    // Store refresh token
    await db.session.create({
      data: {
        refreshToken,
        userAuthId: userAuth.id,
        deviceInfo: userAgent,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    const response = NextResponse.json(
      {
        user: userForResponse,
        expiresIn: 15 * 60, // 15 minutes in seconds
      },
      { status: 200 },
    );

    // Set cookies
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60, // 15 minutes
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: errorMessage(error) },
      { status: 500 },
    );
  }
}
