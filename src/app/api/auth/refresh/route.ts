import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { generateToken } from "~/utils/auth/jwt";

export async function POST(request: NextRequest) {
  try {
    const { userId } = (await request.json()) as { userId: string };

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // FIND VALID SESSION FOR THIS USER
    const session = await db.session.findFirst({
      where: {
        userAuthId: userId,
        isValid: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        userAuth: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "No valid session found" },
        { status: 401 },
      );
    }

    // GENERATE NEW ACCESS TOKEN
    const token = await generateToken({
      userId: session.userAuth.id,
      username: session.userAuth.username,
      role: session.userAuth.role,
    });

    // UPDATE SESSION LAST USED TIMESTAMP
    await db.session.update({
      where: { id: session.id },
      data: { lastUsed: new Date() },
    });

    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Failed to refresh token" },
      { status: 500 },
    );
  }
}
