import React from "react";
import { LoginForm } from "~/components/sign-in/LoginForm";

const MemoizedLoginForm = React.memo(LoginForm);

const SignIn = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <MemoizedLoginForm />
      </div>
    </div>
  );
};
export default SignIn;
