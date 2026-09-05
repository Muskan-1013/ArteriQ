import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { PipelineSection } from "@/components/PipelineSection";

describe("PipelineSection", () => {
  it("renders the circular pipeline with all six step buttons and the ARTERIQ badge", () => {
    render(<PipelineSection />);

    // The centre badge shows the ARTERIQ Pipeline label by default.
    expect(screen.getByText("ARTERIQ")).toBeInTheDocument();
    expect(screen.getByText("Pipeline")).toBeInTheDocument();

    // All six circular step buttons are present with their labels.
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

    // The SVG carries an accessible label describing the circular arrangement.
    expect(
      screen.getByRole("img", {
        name: /ArteriQ pipeline: Measure, Acquire, Process, Analyze, Assess, Report/i,
      }),
    ).toBeInTheDocument();
  });

  it("reveals a step description in the centre when a step is activated", async () => {
    const user = userEvent.setup();
    render(<PipelineSection />);

    // Activate the Measure step via its circular button.
    await user.click(screen.getByTestId("pipeline_step_1"));

    // The centre badge swaps content through an AnimatePresence exit, so the
    // description appears after the short exit animation completes.
    await waitFor(() =>
      expect(
        screen.getByText(/portable, non-invasive sensor captures/i),
      ).toBeInTheDocument(),
    );
  });

  it("does not render any connecting lines or arrows between the step circles", () => {
    render(<PipelineSection />);

    // The circular pipeline should show only the six step circles, with no
    // connecting ring or directional arrow lines between them.
    const svg = screen.getByRole("img", {
      name: /ArteriQ pipeline: Measure, Acquire, Process, Analyze, Assess, Report/i,
    });
    expect(svg.querySelectorAll("line")).toHaveLength(0);
  });

  it("renders the mobile-friendly step list fallback with all six steps", () => {
    render(<PipelineSection />);

    const steps = [
      "Measure",
      "Acquire",
      "Process",
      "Analyze",
      "Assess",
      "Report",
    ];
    for (let i = 0; i < steps.length; i++) {
      expect(
        screen.getByTestId(`pipeline_list_step_${i + 1}`),
      ).toHaveTextContent(steps[i]);
    }
  });
});
