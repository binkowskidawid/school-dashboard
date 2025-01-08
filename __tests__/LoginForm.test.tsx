import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "~/components/sign-in/LoginForm";
import { useAuth } from "~/context/auth/AuthContext";
import { useToast } from "~/hooks/use-toast";

// Mock the modules
jest.mock("~/context/auth/AuthContext");
jest.mock("~/hooks/use-toast");
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Create a wrapper component to provide necessary context
const renderLoginForm = () => {
  return render(<LoginForm />);
};

describe("LoginForm", () => {
  // Setup our mocks before each test
  beforeEach(() => {
    // Mock the auth context with default values
    (useAuth as jest.Mock).mockReturnValue({
      signIn: jest.fn(),
      status: "unauthenticated",
      isPending: false,
      admin: null,
    });

    // Mock the toast hook
    (useToast as jest.Mock).mockReturnValue({
      toast: jest.fn(),
    });
  });

  // Clear all mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Component renders correctly
  it("renders login form with all necessary elements", () => {
    renderLoginForm();

    // Check for the presence of important elements
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Submit button/i }),
    ).toBeInTheDocument();
  });

  // Test 2: Handles empty form submission
  it("shows validation errors when submitting empty form", async () => {
    renderLoginForm();

    // Click the submit button without entering any data
    const submitButton = screen.getByRole("button", { name: /Submit button/i });
    await userEvent.click(submitButton);

    // Check for validation error messages
    await waitFor(() => {
      expect(screen.getByText("Username is required")).toBeInTheDocument();
      expect(screen.getByText("Password is required")).toBeInTheDocument();
    });
  });

  // Test 3: Handles successful login
  it("calls signIn with correct credentials on form submission", async () => {
    const mockSignIn = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
      status: "unauthenticated",
      isPending: false,
      admin: null,
    });

    renderLoginForm();

    // Fill in the form
    await userEvent.type(screen.getByLabelText("Username"), "testuser");
    await userEvent.type(screen.getByLabelText("Password"), "testpass");

    // Submit the form
    const submitButton = screen.getByRole("button", { name: /Submit button/i });
    await userEvent.click(submitButton);

    // Verify signIn was called with correct credentials
    expect(mockSignIn).toHaveBeenCalledWith({
      username: "testuser",
      password: "testpass",
    });
  });

  // Test 4: Shows loading state
  it("displays loading state while submitting", async () => {
    (useAuth as jest.Mock).mockReturnValue({
      signIn: jest.fn(),
      status: "unauthenticated",
      isPending: true,
      admin: null,
    });

    renderLoginForm();

    // Check if the button shows loading state
    expect(screen.getByText("Logging in...")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Submit button/i }),
    ).toBeDisabled();
  });
});
