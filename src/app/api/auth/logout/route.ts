import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "~/server/db";

export async function POST() {
  try {
    // GET THE REFRESH TOKEN FROM COOKIES
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (refreshToken) {
      // INVALIDATE THE SESSION IN THE DATABASE
      await db.session.update({
        where: { refreshToken },
        data: { isValid: false },
      });
    }

    // CREATE RESPONSE THAT WILL CLEAR THE COOKIES
    const response = NextResponse.json({ success: true });

    // CLEAR TOKENS FROM COOKIES
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
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
