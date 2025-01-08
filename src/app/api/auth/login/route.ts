import { NextResponse } from "next/server";
import { db } from "~/server/db";
import errorMessage from "~/utils/errorMessage";

type ReqBodyProps = {
  username?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ReqBodyProps;
    const xForwardFor = request.headers.get("x-forwarded-for");
    const userAgent = request.headers.get("user-agent");

    const { username, password } = body;

    console.log({
      message: "POST /api/login",
      method: request.method,
      path: request.url,
      body: body,
      xForwardFor,
      userAgent,
    });

    if (!username || !password) {
      console.error({
        message: "POST /api/login",
        method: request.method,
        path: request.url,
        error: "Auth data are required",
      });

      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 },
      );
    }

    // Check each user type in sequence to find matching credentials
    // First, check Admin
    const admin = await db.admin.findUnique({
      where: { username },
    });

    if (admin?.password === password) {
      const userData = {
        ...admin,
        password: null,
      };
      return NextResponse.json({ user: userData });
    }

    // Check Teacher
    const teacher = await db.teacher.findUnique({
      where: { username },
    });

    if (teacher?.password === password) {
      const userData = {
        ...teacher,
        password: null,
      };
      return NextResponse.json({ user: userData });
    }

    // Check Student
    const student = await db.student.findUnique({
      where: { username },
    });

    if (student?.password === password) {
      const userData = {
        ...student,
        password: null,
      };
      return NextResponse.json({ user: userData });
    }

    // Check Parent
    const parent = await db.parent.findUnique({
      where: { username },
    });

    if (parent?.password === password) {
      const userData = {
        ...parent,
        password: null,
      };
      return NextResponse.json({ user: userData });
    }

    // If no matching user is found, return an error
    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 },
    );
  } catch (error) {
    console.error({
      message: "Error in api/user/login",
      error: errorMessage(error),
    });
    return NextResponse.json(
      { success: false, error: errorMessage(error) },
      { status: 500 },
    );
  }
}
