import "@testing-library/jest-dom";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import HomePage from "~/app/page";

// Mock the next/navigation module
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

// Mock the next/headers module
jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

describe("HomePage", () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    (cookies as jest.Mock).mockReturnValue({
      get: jest.fn(),
    });
  });

  it("should redirect to sign-in when no user cookie exists", async () => {
    // Mock cookies().get to return null (no cookie)
    (cookies as jest.Mock)().get.mockReturnValue(null);

    // Render the component
    await HomePage();

    // Verify redirect was called with the sign-in path
    expect(redirect).toHaveBeenCalledWith("/sign-in");
  });

  it("should redirect to role-specific route when valid user cookie exists", async () => {
    // Mock a valid user cookie for an admin
    const mockUserCookie = {
      value: JSON.stringify({ role: "ADMIN", name: "Test Admin" }),
    };
    (cookies as jest.Mock)().get.mockReturnValue(mockUserCookie);

    // Render the component
    await HomePage();

    // Verify redirect was called with the admin path
    expect(redirect).toHaveBeenCalledWith("/admin");
  });

  it("should redirect to sign-in when cookie contains invalid JSON", async () => {
    // Mock an invalid user cookie
    const mockInvalidCookie = {
      value: "invalid-json",
    };
    (cookies as jest.Mock)().get.mockReturnValue(mockInvalidCookie);

    // Render the component
    await HomePage();

    // Verify redirect was called with the sign-in path
    expect(redirect).toHaveBeenCalledWith("/sign-in");
  });

  it("should redirect to role-specific route for different user roles", async () => {
    // Test cases for different roles
    const roles = ["TEACHER", "STUDENT", "PARENT", "ADMIN"];

    for (const role of roles) {
      // Reset mocks for each iteration
      jest.clearAllMocks();

      // Mock user cookie for current role
      const mockUserCookie = {
        value: JSON.stringify({ role, name: `Test ${role}` }),
      };
      (cookies as jest.Mock)().get.mockReturnValue(mockUserCookie);

      // Render the component
      await HomePage();

      // Verify redirect was called with the correct role-specific path
      expect(redirect).toHaveBeenCalledWith(`/${role.toLowerCase()}`);
    }
  });
});
