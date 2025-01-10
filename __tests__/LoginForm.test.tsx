import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {LoginForm} from "~/components/sign-in/LoginForm";
import {useAuthContext} from "~/context/auth/AuthContext";
import {useToast} from "~/hooks/use-toast";

/**
 * Mock module configuration for the LoginForm tests
 */
jest.mock("~/context/auth/AuthContext");
jest.mock("~/hooks/use-toast");
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

/**
 * Test suite for the LoginForm component
 * Tests user authentication flow including form validation,
 * submission handling, and various UI states
 */
describe("LoginForm", () => {
  // Set up for managing user interactions
  const user = userEvent.setup();

  // Common test values
  const mockCredentials = {
    username: "testuser",
    password: "testpass",
  };

  /**
   * Helper function to render the LoginForm component with necessary providers
   */
  const renderLoginForm = () => {
    return render(<LoginForm />);
  };

  /**
   * Helper function to fill specific form fields
   * @param fields Object containing the fields to fill
   */
  const fillFormFields = async (fields: {
    username?: string;
    password?: string;
  }) => {
    const { username, password } = fields;

    if (username !== undefined) {
      await user.type(screen.getByLabelText("Username"), username);
    }

    if (password !== undefined) {
      await user.type(screen.getByLabelText("Password"), password);
    }
  };

  beforeEach(() => {
    // Reset default mock implementations before each test
    (useAuthContext as jest.Mock).mockReturnValue({
      signIn: jest.fn(),
      isLoading: false,
    });

    (useToast as jest.Mock).mockReturnValue({
      toast: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders all form elements correctly", () => {
      renderLoginForm();

      // Check for all essential UI elements
      expect(screen.getByText("Welcome back")).toBeInTheDocument();
      expect(
        screen.getByText("Login to your school account"),
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Username")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Submit button/i }),
      ).toBeInTheDocument();
      expect(screen.getByText("Forgot your password?")).toBeInTheDocument();
      expect(screen.getByText(/Don't have an account?/)).toBeInTheDocument();
    });

    it("renders the school image in desktop view", () => {
      renderLoginForm();
      const image = screen.getByAltText("School building cartoon");
      expect(image).toBeInTheDocument();
    });
  });

  describe("Form Validation", () => {
    it("shows validation errors when submitting empty form", async () => {
      renderLoginForm();

      // Submit without filling any fields
      await user.click(screen.getByRole("button", { name: /Submit button/i }));

      // Verify validation messages
      await waitFor(() => {
        expect(screen.getByText("Username is required")).toBeInTheDocument();
        expect(screen.getByText("Password is required")).toBeInTheDocument();
      });
    });

    it("shows validation error when only username is provided", async () => {
      renderLoginForm();

      await fillFormFields({ username: mockCredentials.username });
      await user.click(screen.getByRole("button", { name: /Submit button/i }));

      await waitFor(() => {
        expect(screen.getByText("Password is required")).toBeInTheDocument();
      });
    });

    it("shows validation error when only password is provided", async () => {
      renderLoginForm();

      await fillFormFields({ password: mockCredentials.password });
      await user.click(screen.getByRole("button", { name: /Submit button/i }));

      await waitFor(() => {
        expect(screen.getByText("Username is required")).toBeInTheDocument();
      });
    });
  });

  describe("Form Submission", () => {
    it("handles successful login submission", async () => {
      const mockSignIn = jest.fn();
      (useAuthContext as jest.Mock).mockReturnValue({
        signIn: mockSignIn,
        isLoading: false,
      });

      renderLoginForm();

      await fillFormFields(mockCredentials);
      await user.click(screen.getByRole("button", { name: /Submit button/i }));

      expect(mockSignIn).toHaveBeenCalledWith(mockCredentials);
    });

    it("handles login failure correctly", async () => {
      const mockSignIn = jest
        .fn()
        .mockRejectedValue(new Error("Invalid credentials"));
      (useAuthContext as jest.Mock).mockReturnValue({
        signIn: mockSignIn,
        isLoading: false,
      });

      renderLoginForm();

      await fillFormFields(mockCredentials);
      await user.click(screen.getByRole("button", { name: /Submit button/i }));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled();
      });
    });
  });

  describe("Loading State", () => {
    it("shows loading state while submitting", async () => {
      (useAuthContext as jest.Mock).mockReturnValue({
        signIn: jest.fn(),
        isLoading: true,
      });

      renderLoginForm();

      const submitButton = screen.getByRole("button", {
        name: /Submit button/i,
      });
      expect(screen.getByText("Logging in...")).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      expect(screen.getByLabelText("Username")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
    });
  });

  describe("Additional Features", () => {
    it("shows toast message when clicking forgot password", async () => {
      const mockToast = jest.fn();
      (useToast as jest.Mock).mockReturnValue({ toast: mockToast });

      renderLoginForm();

      await user.click(screen.getByText("Forgot your password?"));

      expect(mockToast).toHaveBeenCalledWith({
        title: "Sorry!",
        description: "This feature is not implemented yet.",
      });
    });

    it("ensures password field is of type password for security", () => {
      renderLoginForm();

      const passwordInput = screen.getByLabelText("Password");
      expect(passwordInput).toHaveAttribute("type", "password");
    });
  });
});
