import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Layout } from "@/components/Layout";
import { ThemeProvider } from "@/hooks/use-theme";
import { resetAuthState, setAuthState } from "@/test/setup";

function renderLayout() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Layout>
          <div data-ocid="test_content">content</div>
        </Layout>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe("Layout header navigation", () => {
  beforeEach(() => {
    resetAuthState();
    setAuthState({ isAuthenticated: true });
  });

  afterEach(() => {
    resetAuthState();
  });

  it("shows the logo on the left and the nav items in right-to-left order", () => {
    renderLayout();

    // Logo is present on the left.
    expect(screen.getByTestId("header_logo")).toBeInTheDocument();

    // All nav items are present.
    expect(screen.getByTestId("nav_home")).toHaveTextContent("Home");
    expect(screen.getByTestId("nav_about")).toHaveTextContent("About Us");
    expect(screen.getByTestId("nav_contact")).toHaveTextContent("Contact Us");
    expect(screen.getByTestId("profile_button")).toBeInTheDocument();

    // Right-to-left order: Profile → Contact Us → About Us → Home.
    // In the DOM the items are laid out left-to-right as Home → About →
    // Contact → Profile, which renders visually right-to-left as required.
    const profile = screen.getByTestId("profile_button");
    const contact = screen.getByTestId("nav_contact");
    const about = screen.getByTestId("nav_about");
    const home = screen.getByTestId("nav_home");
    expect(
      home.compareDocumentPosition(about) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      about.compareDocumentPosition(contact) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      contact.compareDocumentPosition(profile) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("renders the footer with ArteriQ branding", () => {
    renderLayout();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
    expect(
      screen.getByText(/non-invasive cardiovascular risk screening/i),
    ).toBeInTheDocument();
  });
});
