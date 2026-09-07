import { Download, FileText } from "lucide-react";
import { forwardRef, useRef } from "react";

import type {
  Finding,
  RiskLevel,
  RiskReport as RiskReportData,
} from "@/backend";
import { ArteriQLogo } from "@/components/ArteriQLogo";
import { Button } from "@/components/ui/button";
import { downloadReportAsPdf } from "@/lib/pdf";
import { cn } from "@/lib/utils";

export interface AssessmentDetails {
  /** ISO timestamp of when the assessment was generated. */
  generatedAt: string;
  heartRate: string;
  stSegment: string;
  qtInterval: string;
  prInterval: string;
  qrsDuration: string;
  rrInterval: string;
  complexes: string;
  spo2: string;
  temperature: string;
}

interface RiskReportProps {
  report: RiskReportData;
  assessment: AssessmentDetails;
}

const RISK_META: Record<
  RiskLevel,
  { label: string; badge: string; bar: string; dot: string }
> = {
  low: {
    label: "Low",
    badge: "bg-success/15 text-success border-success/30",
    bar: "bg-success",
    dot: "bg-success",
  },
  moderate: {
    label: "Moderate",
    badge: "bg-warning/15 text-warning border-warning/30",
    bar: "bg-warning",
    dot: "bg-warning",
  },
  high: {
    label: "High",
    badge: "bg-destructive/15 text-destructive border-destructive/30",
    bar: "bg-destructive",
    dot: "bg-destructive",
  },
};

const STATUS_META: Record<string, string> = {
  normal: "text-success",
  borderline: "text-warning",
  abnormal: "text-destructive",
};

function formatFindingStatus(status: string): string {
  const key = status.toLowerCase();
  return STATUS_META[key] ?? "text-foreground";
}

/**
 * Clinical-style Risk Report. Rendered like a real medical report with an
 * ArteriQ-branded header, patient/assessment details, a structured findings
 * table, a colour-coded risk level, a concise clinical explanation and a
 * preliminary-screening disclaimer. The whole report sits inside a
 * glassmorphism container and can be downloaded as a PDF.
 */
export const RiskReport = forwardRef<HTMLDivElement, RiskReportProps>(
  function RiskReport({ report, assessment }) {
    const risk = RISK_META[report.riskLevel] ?? RISK_META.moderate;
    const generated = new Date(assessment.generatedAt);

    // Internal ref to the report document so the Download button always has a
    // valid element to capture, regardless of whether a ref is forwarded in.
    const reportRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
      const element = reportRef.current;
      if (!element) return;
      try {
        await downloadReportAsPdf(element);
      } catch (error) {
        // Never swallow the failure silently — surface it so the click never
        // appears to do nothing.
        console.error("Failed to download the report as a PDF", error);
      }
    };

    return (
      <div className="glass-strong rounded-3xl p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <FileText className="size-4 text-primary" />
            Preliminary Risk Report
          </div>
          <Button
            data-ocid="report_download_button"
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={handleDownload}
          >
            <Download className="size-4" />
            Download PDF
          </Button>
        </div>

        {/* Report document — captured for PDF export */}
        <div
          ref={reportRef}
          data-ocid="risk_report"
          className="overflow-hidden rounded-2xl bg-background text-foreground"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-4 border-b border-border bg-secondary/40 px-6 py-5">
            <div className="flex items-center gap-3">
              <ArteriQLogo size={44} />
              <div>
                <p className="font-display text-xl tracking-wide text-foreground">
                  ArteriQ
                </p>
                <p className="text-xs text-muted-foreground">
                  Cardiovascular Risk Screening
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-sm uppercase tracking-wider text-muted-foreground">
                Risk Assessment Report
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {generated.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Assessment details */}
          <div className="grid gap-x-8 gap-y-3 border-b border-border px-6 py-5 sm:grid-cols-2">
            <Detail label="Heart rate" value={assessment.heartRate} />
            <Detail label="ST segment" value={assessment.stSegment} />
            <Detail label="QT interval" value={assessment.qtInterval} />
            <Detail label="PR interval" value={assessment.prInterval} />
            <Detail label="QRS duration" value={assessment.qrsDuration} />
            <Detail label="RR interval" value={assessment.rrInterval} />
            <Detail label="P/QRS/T complexes" value={assessment.complexes} />
            <Detail label="SpO₂" value={assessment.spo2} />
            <Detail label="Temperature" value={assessment.temperature} />
          </div>

          {/* Risk level */}
          <div className="border-b border-border px-6 py-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Overall risk level
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-display text-lg tracking-wide",
                  risk.badge,
                )}
              >
                <span className={cn("size-2 rounded-full", risk.dot)} />
                {risk.label}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full", risk.bar)}
                  style={{
                    width:
                      report.riskLevel === "low"
                        ? "33%"
                        : report.riskLevel === "moderate"
                          ? "66%"
                          : "100%",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Findings table */}
          <div className="px-6 py-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Structured findings
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Parameter</th>
                    <th className="py-2 pr-4 font-medium">Value</th>
                    <th className="py-2 pr-4 font-medium">Reference range</th>
                    <th className="py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {report.findings.map((finding: Finding, i: number) => (
                    <tr
                      key={`${finding.parameter}-${i}`}
                      data-ocid={`report_finding_row_${i + 1}`}
                      className="border-b border-border/60 last:border-0"
                    >
                      <td className="py-2.5 pr-4 font-medium text-foreground">
                        {finding.parameter}
                      </td>
                      <td className="py-2.5 pr-4 text-foreground">
                        {finding.value}
                      </td>
                      <td className="py-2.5 pr-4 text-muted-foreground">
                        {finding.referenceRange}
                      </td>
                      <td
                        className={cn(
                          "py-2.5 font-medium capitalize",
                          formatFindingStatus(finding.status),
                        )}
                      >
                        {finding.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Clinical explanation */}
          <div className="border-t border-border bg-secondary/30 px-6 py-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Clinical explanation
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground">
              {report.clinicalExplanation}
            </p>
          </div>

          {/* Disclaimer */}
          <div className="border-t border-border bg-muted/40 px-6 py-4">
            <p className="text-xs leading-relaxed text-muted-foreground">
              {report.disclaimer}
            </p>
          </div>
        </div>
      </div>
    );
  },
);

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/40 pb-2 sm:border-0 sm:pb-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
