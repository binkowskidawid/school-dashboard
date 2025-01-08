import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { User } from "~/types/user";

export default async function HomePage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user");

  if (!userCookie) {
    redirect("/sign-in");
  }

  try {
    const userData = JSON.parse(userCookie.value) as User;
    const roleRoute = `/${userData.role.toLowerCase()}`;
    redirect(roleRoute);
  } catch (error) {
    redirect("/sign-in");
  }
}
