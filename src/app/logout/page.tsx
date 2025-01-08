"use client";

import { useEffect } from "react";
import { LoadingScreen } from "~/components/state/LoadingScreen";
import { useAuth } from "~/context/auth/AuthContext";

const LogoutPage = () => {
  const { signOut } = useAuth();

  useEffect(() => {
    signOut().catch(console.error);
  }, []);

  return <LoadingScreen />;
};
export default LogoutPage;
