"use client";

import { useEffect } from "react";
import { LoadingScreen } from "~/components/state/LoadingScreen";
import { useAuthContext } from "~/context/auth/AuthContext";

const LogoutPage = () => {
  const { signOut } = useAuthContext();

  useEffect(() => {
    signOut().catch(console.error);
  }, []);

  return <LoadingScreen />;
};
export default LogoutPage;
