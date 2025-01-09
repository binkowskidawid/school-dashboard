import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "~/server/db";
import { generateAccessToken } from "~/utils/auth/jwt";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token is required" },
        { status: 401 },
      );
    }

    // VERIFY REFRESH TOKEN
    const session = await db.session.findUnique({
      where: { refreshToken },
      include: { userAuth: true },
    });

    if (!session || !session.isValid || session.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 },
      );
    }

    // GENERATE NEW ACCESS TOKEN
    const accessToken = generateAccessToken({
      userId: session.userAuth.id,
      username: session.userAuth.username,
      role: session.userAuth.role,
    });

    // UPDATE SESSION LAST USED
    await db.session.update({
      where: { id: session.id },
      data: { lastUsed: new Date() },
    });

    const response = NextResponse.json({ success: true });

    // SET NEW ACCESS TOKEN IN COOKIES
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60, // 15 minutes
    });

    return response;
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json(
      { error: "An error occurred while refreshing token" },
      { status: 500 },
    );
  }
}
