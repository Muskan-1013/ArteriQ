import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RiskLevel, type RiskReport } from "@/backend";
import { RiskAssessmentSection } from "@/components/RiskAssessmentSection";
import {
  mockActorState,
  resetActorState,
  resetAuthState,
  setAuthState,
} from "@/test/setup";

function renderSection() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <RiskAssessmentSection />
    </QueryClientProvider>,
  );
}

const mockReport: RiskReport = {
  riskLevel: RiskLevel.moderate,
  findings: [
    {
      parameter: "Heart rate",
      value: "72 bpm",
      referenceRange: "60-100 bpm",
      status: "Normal",
    },
    {
      parameter: "ST segment",
      value: "0.05 mV",
      referenceRange: "-0.5 to +0.5 mV",
      status: "Normal",
    },
  ],
  clinicalExplanation:
    "Based on the physiological parameters provided, the overall cardiovascular risk appears moderate.",
  disclaimer:
    "This report is a preliminary screening tool only and is not a medical diagnosis.",
};

describe("RiskAssessmentSection", () => {
  beforeEach(() => {
    resetActorState();
    resetAuthState();
    mockActorState.actor = {
      assessRisk: vi.fn().mockResolvedValue(mockReport),
    };
  });

  afterEach(() => {
    resetActorState();
    resetAuthState();
  });

  it("renders all physiological inputs including the ultrasound upload", () => {
    renderSection();

    expect(screen.getByLabelText(/heart rate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/st segment/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/qt interval/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pr interval/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/qrs duration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/rr interval/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/p\/qrs\/t complexes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/spo₂/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/temperature/i)).toBeInTheDocument();
    expect(screen.getByTestId("risk_upload_button")).toBeInTheDocument();
  });

  it("submits the form and renders a clinical-style risk report", async () => {
    const user = userEvent.setup();
    renderSection();

    await user.type(screen.getByLabelText(/heart rate/i), "72");
    await user.type(screen.getByLabelText(/st segment/i), "0.05");
    await user.type(screen.getByLabelText(/qt interval/i), "400");
    await user.type(screen.getByLabelText(/pr interval/i), "160");
    await user.type(screen.getByLabelText(/qrs duration/i), "90");
    await user.type(screen.getByLabelText(/rr interval/i), "830");
    await user.type(screen.getByLabelText(/p\/qrs\/t complexes/i), "Normal");
    await user.type(screen.getByLabelText(/spo₂/i), "98");
    await user.type(screen.getByLabelText(/temperature/i), "36.6");

    await user.click(screen.getByTestId("risk_submit_button"));

    // The report renders with the logo header, findings table, risk level,
    // clinical explanation and disclaimer.
    await waitFor(() => {
      expect(screen.getByTestId("risk_report")).toBeInTheDocument();
    });
    expect(screen.getByText("Preliminary Risk Report")).toBeInTheDocument();
    expect(screen.getByText("Moderate")).toBeInTheDocument();
    expect(screen.getByText("Structured findings")).toBeInTheDocument();
    expect(screen.getByText("Clinical explanation")).toBeInTheDocument();
    expect(
      screen.getByText(/preliminary screening tool only/i),
    ).toBeInTheDocument();
    expect(screen.getByTestId("report_download_button")).toBeInTheDocument();
  });

  it("shows an error state when the backend call fails", async () => {
    const user = userEvent.setup();
    mockActorState.actor = {
      assessRisk: vi.fn().mockRejectedValue(new Error("boom")),
    };
    renderSection();

    await user.type(screen.getByLabelText(/heart rate/i), "72");
    await user.click(screen.getByTestId("risk_submit_button"));

    await waitFor(() => {
      expect(screen.getByTestId("risk_error_state")).toBeInTheDocument();
    });
  });

  it("saves the generated report to the signed-in user's account", async () => {
    const user = userEvent.setup();
    const saveReport = vi.fn().mockResolvedValue({
      __kind__: "ok",
      ok: { id: 1n, report: mockReport, createdAt: 0n },
    });
    mockActorState.actor = {
      assessRisk: vi.fn().mockResolvedValue(mockReport),
      saveReport,
    };
    setAuthState({
      isAuthenticated: true,
      token: "session-token",
      user: { id: "1", name: "Jane Doe", email: "jane@example.com" },
    });
    renderSection();

    await user.type(screen.getByLabelText(/heart rate/i), "72");
    await user.click(screen.getByTestId("risk_submit_button"));

    await waitFor(() => {
      expect(screen.getByTestId("risk_report")).toBeInTheDocument();
    });

    // The save-to-account control is present and enabled for a signed-in user.
    const saveButton = screen.getByTestId("report_save_button");
    expect(saveButton).toBeEnabled();

    await user.click(saveButton);

    await waitFor(() => {
      expect(saveReport).toHaveBeenCalledTimes(1);
      expect(saveReport).toHaveBeenCalledWith(
        "session-token",
        expect.objectContaining({ riskLevel: RiskLevel.moderate }),
      );
    });
    expect(screen.getByText("Saved to account")).toBeInTheDocument();
  });

  it("disables saving to account for an unauthenticated user", async () => {
    const user = userEvent.setup();
    mockActorState.actor = {
      assessRisk: vi.fn().mockResolvedValue(mockReport),
    };
    renderSection();

    await user.type(screen.getByLabelText(/heart rate/i), "72");
    await user.click(screen.getByTestId("risk_submit_button"));

    await waitFor(() => {
      expect(screen.getByTestId("risk_report")).toBeInTheDocument();
    });

    // Without a session token the save button is disabled.
    expect(screen.getByTestId("report_save_button")).toBeDisabled();
    expect(
      screen.getByText(/sign in to keep a private copy/i),
    ).toBeInTheDocument();
  });
});
