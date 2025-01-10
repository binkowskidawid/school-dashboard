import { NextResponse } from "next/server";

export async function POST() {
  try {
    // CREATE RESPONSE THAT WILL CLEAR THE COOKIES
    const response = NextResponse.json({ success: true });

    // CLEAR TOKENS FROM COOKIES
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
