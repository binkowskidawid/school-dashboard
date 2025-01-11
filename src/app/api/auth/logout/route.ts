import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("X-User-Id");

    if (userId) {
      await db.session.updateMany({
        where: { userAuthId: userId },
        data: { isValid: false },
      });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete("authToken");
    response.cookies.delete("user");

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "An error occurred during logout" },
      { status: 500 },
    );
  }
}
