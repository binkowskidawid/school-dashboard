import { NextResponse } from "next/server";
import { db } from "~/server/db";
import errorMessage from "~/utils/errorMessage";

type ReqBodyProps = {
  username?: string;
  password?: string;
};

export async function POST(request: Request) {
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

  try {
    const admin = await db.admin.findUnique({
      where: {
        username: username,
      },
    });

    if (!admin) {
      console.error({
        message: "POST /api/login",
        method: request.method,
        path: request.url,
        body: body,
        error: "Customer not found",
      });

      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }

    if (admin.password !== password) {
      console.error({
        message: "POST /api/login",
        method: request.method,
        error: "Password is incorrect",
      });

      return NextResponse.json(
        { error: "Password is incorrect" },
        { status: 401 },
      );
    }

    const adminData = {
      id: admin.id,
      name: admin.name,
      username: admin.username,
      password: null,
    };

    return NextResponse.json({ admin: adminData }, { status: 200 });
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
