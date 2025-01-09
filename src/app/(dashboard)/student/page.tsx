"use client";

import { useAuthContext } from "~/context/auth/AuthContext";

const StudentPage = () => {
  const { user } = useAuthContext();

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-2xl font-bold">Welcome, {user?.name}!</h1>
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        {/* Content will vary based on user role */}
        <p className="text-card-foreground">
          You are logged in as a {user?.role.toLowerCase()}.
        </p>
      </div>
    </div>
  );
};

export default StudentPage;
