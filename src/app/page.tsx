import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { User } from "~/types/user";

export default async function HomePage() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user");
  const authCookie = cookieStore.get("authToken");

  try {
    if (!userCookie?.value || !authCookie?.value) {
      redirect("/sign-in");
    }

    const user = JSON.parse(userCookie.value) as User;
    redirect(`/${user.role.toLowerCase()}`);
  } catch (error) {
    redirect("/sign-in");
  }
}
