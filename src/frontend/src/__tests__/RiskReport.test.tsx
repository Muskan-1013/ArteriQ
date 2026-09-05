import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RiskLevel, type RiskReport as RiskReportData } from "@/backend";
import { RiskReport } from "@/components/RiskReport";

const mockReport: RiskReportData = {
  riskLevel: RiskLevel.high,
  findings: [
    {
      parameter: "Heart rate",
      value: "140 bpm",
      referenceRange: "60-100 bpm",
      status: "Abnormal",
    },
    {
      parameter: "SpO₂",
      value: "85 %",
      referenceRange: "95-100%",
      status: "Abnormal",
    },
  ],
  clinicalExplanation:
    "Based on the physiological parameters provided, the overall cardiovascular risk appears high.",
  disclaimer:
    "This report is a preliminary screening tool only and is not a medical diagnosis.",
};

const assessment = {
  generatedAt: "2026-09-05T10:00:00.000Z",
  heartRate: "140 bpm",
  stSegment: "2.5 mV",
  qtInterval: "520 ms",
  prInterval: "260 ms",
  qrsDuration: "160 ms",
  rrInterval: "400 ms",
  complexes: "Abnormal ectopic beats",
  spo2: "85 %",
  temperature: "39.5 °C",
};

const downloadSpy = vi.fn();

vi.mock("@/lib/pdf", () => ({
  downloadReportAsPdf: (element: HTMLElement) => {
    return downloadSpy(element);
  },
}));

describe("RiskReport", () => {
  beforeEach(() => {
    downloadSpy.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the report header, findings table, risk level and disclaimer", () => {
    render(<RiskReport report={mockReport} assessment={assessment} />);

    expect(screen.getByText("Preliminary Risk Report")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.getByText("Structured findings")).toBeInTheDocument();
    expect(screen.getAllByText("Heart rate").length).toBeGreaterThan(0);
    expect(screen.getAllByText("140 bpm").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Abnormal").length).toBeGreaterThan(0);
    expect(screen.getByText("Clinical explanation")).toBeInTheDocument();
    expect(
      screen.getByText(/preliminary screening tool only/i),
    ).toBeInTheDocument();
  });

  it("downloads the report as a PDF when the download button is clicked", async () => {
    const user = userEvent.setup();
    render(<RiskReport report={mockReport} assessment={assessment} />);

    await user.click(screen.getByTestId("report_download_button"));

    expect(downloadSpy).toHaveBeenCalledTimes(1);
    const element = downloadSpy.mock.calls[0][0];
    expect(element).toBeInstanceOf(HTMLElement);
  });

  it("surfaces a PDF download failure instead of swallowing it", async () => {
    const user = userEvent.setup();
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    downloadSpy.mockRejectedValueOnce(new Error("capture failed"));

    render(<RiskReport report={mockReport} assessment={assessment} />);

    await user.click(screen.getByTestId("report_download_button"));

    // The click never appears to do nothing: the failure is logged so it is
    // surfaced rather than silently swallowed.
    expect(downloadSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(
      "Failed to download the report as a PDF",
      expect.any(Error),
    );

    errorSpy.mockRestore();
  });

  it("renders the ArteriQ-branded header with the logo and report title", () => {
    render(<RiskReport report={mockReport} assessment={assessment} />);

    // The report document carries the ArteriQ logo and "Cardiovascular Risk
    // Screening" subtitle in its header.
    expect(screen.getByRole("img", { name: "ArteriQ" })).toBeInTheDocument();
    expect(
      screen.getByText("Cardiovascular Risk Screening"),
    ).toBeInTheDocument();
    expect(screen.getByText("Risk Assessment Report")).toBeInTheDocument();
  });

  it("renders the colour-coded risk level for a low-risk report", () => {
    const lowReport: RiskReportData = {
      ...mockReport,
      riskLevel: RiskLevel.low,
    };
    render(<RiskReport report={lowReport} assessment={assessment} />);

    expect(screen.getByText("Low")).toBeInTheDocument();
    expect(screen.queryByText("High")).not.toBeInTheDocument();
    expect(screen.queryByText("Moderate")).not.toBeInTheDocument();
  });

  it("renders the indicator dot next to the Low risk badge", () => {
    const lowReport: RiskReportData = {
      ...mockReport,
      riskLevel: RiskLevel.low,
    };
    render(<RiskReport report={lowReport} assessment={assessment} />);

    // The Low badge carries a small indicator dot (the `size-2 rounded-full`
    // span) that uses the `success` colour. It must be present and sit inside
    // the badge next to the "Low" label.
    const badge = screen.getByText("Low").closest("span");
    expect(badge).not.toBeNull();
    const dot = badge?.querySelector("span.size-2.rounded-full");
    expect(dot).not.toBeNull();
    expect(dot?.className).toContain("bg-success");
  });

  it("renders the colour-coded risk level for a moderate-risk report", () => {
    const moderateReport: RiskReportData = {
      ...mockReport,
      riskLevel: RiskLevel.moderate,
    };
    render(<RiskReport report={moderateReport} assessment={assessment} />);

    expect(screen.getByText("Moderate")).toBeInTheDocument();
    expect(screen.queryByText("High")).not.toBeInTheDocument();
    expect(screen.queryByText("Low")).not.toBeInTheDocument();
  });
});
