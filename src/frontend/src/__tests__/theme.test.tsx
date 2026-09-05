import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { LoginPage } from "@/components/LoginPage";
import { ThemeProvider } from "@/hooks/use-theme";
import { resetAuthState } from "@/test/setup";

function renderLogin() {
  return render(
    <ThemeProvider>
      <LoginPage />
    </ThemeProvider>,
  );
}

describe("dark-mode support", () => {
  beforeEach(() => {
    resetAuthState();
    window.localStorage.clear();
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "";
  });

  afterEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("toggles the dark class on the document root and persists the choice", async () => {
    const user = userEvent.setup();
    renderLogin();

    // Defaults to light (no stored preference, light system theme).
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    await user.click(screen.getByTestId("login_theme_toggle"));

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(window.localStorage.getItem("arteriq-theme")).toBe("dark");

    await user.click(screen.getByTestId("login_theme_toggle"));

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(window.localStorage.getItem("arteriq-theme")).toBe("light");
  });

  it("applies the stored dark preference on load", () => {
    window.localStorage.setItem("arteriq-theme", "dark");
    renderLogin();

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
