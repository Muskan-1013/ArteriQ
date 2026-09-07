import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "@/App";
import { ThemeProvider } from "@/hooks/use-theme";
import { resetAuthState, setAuthState } from "@/test/setup";

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe("App splash-to-login and auth gating", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetAuthState();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the first splash on load, then transitions to the email + password Login / Sign-Up", () => {
    renderApp();

    // First splash is visible with the centred ArteriQ logo.
    expect(screen.getByTestId("splash_screen")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "ArteriQ" })).toBeInTheDocument();

    // After the first splash duration plus its exit animation, the Login /
    // Sign-Up page appears with the email + password form.
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByTestId("login_panel")).toBeInTheDocument();
    expect(screen.getByTestId("auth_email_input")).toBeInTheDocument();
    expect(screen.getByTestId("auth_password_input")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("offers no social, Google, Apple or internet-identity login options", () => {
    renderApp();
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByTestId("login_panel")).toBeInTheDocument();
    expect(screen.queryByText(/internet identity/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/google/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/apple/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/continue with/i)).not.toBeInTheDocument();
  });

  it("does not show main content to an unauthenticated user", () => {
    renderApp();
    act(() => {
      vi.advanceTimersByTime(1800);
    });

    expect(screen.getByTestId("login_panel")).toBeInTheDocument();
    expect(screen.queryByTestId("hero_section")).not.toBeInTheDocument();
    expect(screen.queryByTestId("header_nav")).not.toBeInTheDocument();
  });

  it("shows the full site to an authenticated user after the second splash", () => {
    setAuthState({ isAuthenticated: true });
    renderApp();

    // Authenticated user sees the header and hero immediately (no login).
    expect(screen.getByTestId("header_nav")).toBeInTheDocument();
    expect(screen.getByTestId("hero_section")).toBeInTheDocument();
    expect(screen.queryByTestId("login_panel")).not.toBeInTheDocument();
  });

  it("shows the second splash on interactive login success, then reveals content", () => {
    setAuthState({ isAuthenticated: true, isLoginSuccess: true });
    renderApp();

    // Second splash overlay is present.
    expect(screen.getByTestId("second_splash")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    // The authenticated content is revealed behind the second splash.
    expect(screen.getByTestId("hero_section")).toBeInTheDocument();
    expect(screen.getByTestId("header_nav")).toBeInTheDocument();
  });
});
