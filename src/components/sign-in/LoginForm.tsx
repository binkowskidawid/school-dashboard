"use client";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { type ComponentProps, useEffect } from "react";
import { useToast } from "~/hooks/use-toast";
import { z } from "zod";
import { useAuth } from "~/context/auth/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import Image from "next/image";
import Link from "next/link";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export function LoginForm({ className, ...props }: ComponentProps<"div">) {
  const { toast } = useToast();
  const { signIn, isPending, user, status } = useAuth();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    // IF USER IS ALREADY AUTHENTICATED, LET THE MIDDLEWARE HANDLE THE REDIRECT
    if (status === "authenticated" && user?.role) {
      const dashboardPath = `/${user.role.toLowerCase()}`;
      console.log(
        "SignIn page: Detected authenticated user, navigating to",
        dashboardPath,
      );
      router.push(dashboardPath);
    }
  }, [status, user, router]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await signIn(values);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">Welcome back</h1>
                  <p className="text-balance text-muted-foreground">
                    Login to your school account
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your username"
                          aria-label={"Username input"}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className={"m-0 text-[12px]"} />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center">
                        <FormLabel>Password</FormLabel>
                        <Button
                          variant="link"
                          type="button"
                          aria-label={"Forgot password button"}
                          className="ml-auto h-auto p-0 text-sm font-normal underline-offset-2 hover:underline"
                          onClick={() => {
                            toast({
                              title: "Sorry!",
                              description:
                                "This feature is not implemented yet.",
                            });
                          }}
                        >
                          Forgot your password?
                        </Button>
                      </div>
                      <FormControl>
                        <Input
                          type="password"
                          aria-label={"Password input"}
                          placeholder="Your password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className={"m-0 text-[12px]"} />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  aria-label={"Submit button"}
                  className="flex w-full items-center justify-center gap-2"
                  disabled={isPending}
                >
                  <Loader
                    className={cn("mr-2 animate-spin", {
                      hidden: !isPending,
                    })}
                  />
                  {isPending ? "Logging in..." : "Login"}
                </Button>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Button
                    variant="link"
                    type="button"
                    aria-label={"Sign up button"}
                    className="m-0 h-auto p-0 underline underline-offset-4"
                  >
                    Sign up
                  </Button>
                </div>
              </div>
            </form>
          </Form>
          <div className="relative hidden h-full w-full bg-muted md:block">
            <div className="relative m-auto h-[90%] w-[90%]">
              <Image
                src="/images/school.png"
                alt="School building cartoon"
                aria-label={"School building cartoon"}
                className="object-contain dark:brightness-[0.2] dark:grayscale"
                fill
                sizes="(min-width: 768px) 45vw, 90vw"
                priority
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-xs text-muted-foreground">
              Image from{" "}
              <Link
                href="https://pngtree.com/freepng/school-building-cartoon_9100591.html"
                suppressHydrationWarning
              >
                pngtree.com
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our{" "}
        <a href="#" aria-label={"Terms of Service link"}>
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" aria-label={"Privacy policy link"}>
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}
