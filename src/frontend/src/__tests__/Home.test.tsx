import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { Home } from "@/pages/Home";
import { resetActorState, resetAuthState } from "@/test/setup";

function renderHome() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>,
  );
}

describe("Home page", () => {
  beforeEach(() => {
    resetAuthState();
    resetActorState();
  });

  afterEach(() => {
    resetActorState();
  });

  it("renders the hero with the pill badge and the 'Your heart, understood early' headline", () => {
    renderHome();

    // The pill badge with the preliminary-screening tagline.
    expect(
      screen.getByText(/✦ PRELIMINARY SCREENING · BY DESIGN/i),
    ).toBeInTheDocument();

    // The headline with 'understood' emphasised in the wine primary colour.
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toContain("Your heart,");
    expect(heading.textContent).toContain("understood");
    expect(heading.textContent).toContain("early");
    const emphasised = heading.querySelector(".text-primary");
    expect(emphasised).not.toBeNull();
    expect(emphasised?.textContent).toBe("understood");

    // The supporting paragraph and the two hero buttons.
    const hero = screen.getByTestId("hero_section");
    expect(
      within(hero).getByText(/helps you understand your heart health early/i),
    ).toBeInTheDocument();
    expect(screen.getByTestId("hero_cta")).toHaveTextContent("Learn more");
    expect(screen.getByTestId("hero_secondary")).toHaveTextContent(
      "Contact us",
    );
  });

  it("renders the circular pipeline with six steps and the ARTERIQ Pipeline badge", () => {
    renderHome();

    // The centre badge shows the ARTERIQ Pipeline label by default.
    expect(screen.getByText("ARTERIQ")).toBeInTheDocument();
    expect(screen.getByText("Pipeline")).toBeInTheDocument();

    // All six circular step buttons are present.
    const steps = [
      "Measure",
      "Acquire",
      "Process",
      "Analyze",
      "Assess",
      "Report",
    ];
    for (let i = 0; i < steps.length; i++) {
      expect(screen.getByTestId(`pipeline_step_${i + 1}`)).toHaveTextContent(
        steps[i],
      );
    }
  });

  it("shows a step description when a pipeline step is activated", async () => {
    const user = userEvent.setup();
    renderHome();

    // Activate the Measure step via the mobile-friendly list fallback.
    await user.click(screen.getByTestId("pipeline_list_step_1"));
    // The centre badge swaps content through an AnimatePresence exit, so the
    // description appears after the short exit animation completes.
    await waitFor(() =>
      expect(
        screen.getByText(/portable, non-invasive sensor captures/i),
      ).toBeInTheDocument(),
    );
  });

  it("renders the contact section with contact info and a working form", async () => {
    const user = userEvent.setup();
    renderHome();

    expect(screen.getByTestId("contact_section")).toBeInTheDocument();
    expect(screen.getByText("hello@arteriq.health")).toBeInTheDocument();
    expect(screen.getByText("+1 (555) 012-3456")).toBeInTheDocument();

    // Fill and submit the contact form.
    await user.type(screen.getByTestId("contact_name_input"), "Jane Doe");
    await user.type(
      screen.getByTestId("contact_email_input"),
      "jane@example.com",
    );
    await user.type(
      screen.getByTestId("contact_message_input"),
      "Hello ArteriQ",
    );
    await user.click(screen.getByTestId("contact_submit_button"));

    expect(screen.getByTestId("contact_success")).toBeInTheDocument();
    expect(screen.getByText(/thank you, jane doe/i)).toBeInTheDocument();
  });
});
