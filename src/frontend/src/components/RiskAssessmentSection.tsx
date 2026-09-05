import { useMutation } from "@tanstack/react-query";
import {
  Activity,
  Bookmark,
  Check,
  HeartPulse,
  ImagePlus,
  Loader2,
  ShieldCheck,
  Thermometer,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";

import type {
  RiskAssessmentInput,
  RiskReport as RiskReportData,
} from "@/backend";
import { type AssessmentDetails, RiskReport } from "@/components/RiskReport";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActor } from "@/hooks/useActor";
import { useAuth } from "@/hooks/useAuth";
import { useSaveReport } from "@/hooks/useQueries";

interface FieldDef {
  key: keyof RiskAssessmentInput;
  label: string;
  unit: string;
  placeholder: string;
  type?: "number" | "text";
}

const FIELDS: FieldDef[] = [
  {
    key: "heartRate",
    label: "Heart rate",
    unit: "bpm",
    placeholder: "72",
    type: "number",
  },
  {
    key: "stSegment",
    label: "ST segment",
    unit: "mV",
    placeholder: "0.05",
    type: "number",
  },
  {
    key: "qtInterval",
    label: "QT interval",
    unit: "ms",
    placeholder: "400",
    type: "number",
  },
  {
    key: "prInterval",
    label: "PR interval",
    unit: "ms",
    placeholder: "160",
    type: "number",
  },
  {
    key: "qrsDuration",
    label: "QRS duration",
    unit: "ms",
    placeholder: "90",
    type: "number",
  },
  {
    key: "rrInterval",
    label: "RR interval",
    unit: "ms",
    placeholder: "830",
    type: "number",
  },
  {
    key: "complexes",
    label: "P/QRS/T complexes",
    unit: "",
    placeholder: "Normal",
    type: "text",
  },
  { key: "spo2", label: "SpO₂", unit: "%", placeholder: "98", type: "number" },
  {
    key: "temperature",
    label: "Temperature",
    unit: "°C",
    placeholder: "36.6",
    type: "number",
  },
];

function useAssessRisk() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (input: RiskAssessmentInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.assessRisk(input);
    },
  });
}

/**
 * Risk Assessment section — a glassmorphism form capturing physiological
 * inputs (plus an optional ultrasound image) that calls the backend
 * `assessRisk` method and renders the returned clinical Risk Report.
 */
export function RiskAssessmentSection() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [ultrasound, setUltrasound] = useState<Uint8Array | null>(null);
  const [ultrasoundName, setUltrasoundName] = useState<string>("");
  const [report, setReport] = useState<RiskReportData | null>(null);
  const [assessment, setAssessment] = useState<AssessmentDetails | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const assess = useAssessRisk();
  const saveReport = useSaveReport();
  const { token, isAuthenticated } = useAuth();

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const buffer = await file.arrayBuffer();
    setUltrasound(new Uint8Array(buffer));
    setUltrasoundName(file.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const input: RiskAssessmentInput = {
      heartRate: BigInt(values.heartRate ?? "0"),
      stSegment: Number(values.stSegment ?? "0"),
      qtInterval: BigInt(values.qtInterval ?? "0"),
      prInterval: BigInt(values.prInterval ?? "0"),
      qrsDuration: BigInt(values.qrsDuration ?? "0"),
      rrInterval: BigInt(values.rrInterval ?? "0"),
      complexes: values.complexes ?? "",
      spo2: BigInt(values.spo2 ?? "0"),
      temperature: Number(values.temperature ?? "0"),
      ...(ultrasound ? { ultrasoundImage: ultrasound } : {}),
    };

    assess.mutate(input, {
      onSuccess: (result) => {
        setReport(result);
        setAssessment({
          generatedAt: new Date().toISOString(),
          heartRate: `${values.heartRate ?? "0"} bpm`,
          stSegment: `${values.stSegment ?? "0"} mV`,
          qtInterval: `${values.qtInterval ?? "0"} ms`,
          prInterval: `${values.prInterval ?? "0"} ms`,
          qrsDuration: `${values.qrsDuration ?? "0"} ms`,
          rrInterval: `${values.rrInterval ?? "0"} ms`,
          complexes: values.complexes ?? "—",
          spo2: `${values.spo2 ?? "0"} %`,
          temperature: `${values.temperature ?? "0"} °C`,
        });
      },
    });
  };

  const reset = () => {
    setValues({});
    setUltrasound(null);
    setUltrasoundName("");
    setReport(null);
    setAssessment(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <section
      id="risk-assessment"
      data-ocid="risk_assessment_section"
      className="scroll-mt-24 px-4 pt-20"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs font-medium text-secondary-foreground">
            <HeartPulse className="size-3.5" />
            Preliminary screening
          </span>
          <h2 className="mt-5 font-display text-3xl tracking-tight text-foreground sm:text-4xl">
            Cardiovascular risk assessment
          </h2>
          <p className="mt-4 text-muted-foreground">
            Enter your physiological readings to generate a preliminary,
            AI-assisted risk report. This is a screening tool only — it is not a
            medical diagnosis.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12"
        >
          <form
            data-ocid="risk_assessment_form"
            onSubmit={handleSubmit}
            className="glass rounded-3xl p-6 sm:p-8"
          >
            <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              {FIELDS.map((field) => (
                <div key={field.key} className="flex flex-col gap-1.5">
                  <Label
                    htmlFor={`risk_${field.key}`}
                    className="text-foreground"
                  >
                    {field.label}
                    {field.unit && (
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        ({field.unit})
                      </span>
                    )}
                  </Label>
                  <div className="relative">
                    <Input
                      id={`risk_${field.key}`}
                      data-ocid={`risk_input_${field.key}`}
                      type={field.type ?? "number"}
                      step={field.type === "number" ? "any" : undefined}
                      inputMode={
                        field.type === "number" ? "decimal" : undefined
                      }
                      placeholder={field.placeholder}
                      value={values[field.key] ?? ""}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className="bg-background/60 pr-10"
                    />
                    {field.unit && (
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                        {field.unit}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* Ultrasound image upload */}
              <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3">
                <Label htmlFor="risk_ultrasound" className="text-foreground">
                  Ultrasound image
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <button
                  type="button"
                  data-ocid="risk_upload_button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex min-h-12 items-center justify-center gap-2 rounded-md border border-dashed border-input bg-background/40 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-ring hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
                >
                  {ultrasoundName ? (
                    <>
                      <ImagePlus className="size-4 text-primary" />
                      {ultrasoundName}
                    </>
                  ) : (
                    <>
                      <Upload className="size-4" />
                      Upload ultrasound image
                    </>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  id="risk_ultrasound"
                  data-ocid="risk_ultrasound_input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button
                data-ocid="risk_submit_button"
                type="submit"
                size="lg"
                className="rounded-full px-8"
                disabled={assess.isPending}
              >
                {assess.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Analysing…
                  </>
                ) : (
                  <>
                    <Activity className="size-4" />
                    Generate risk report
                  </>
                )}
              </Button>
              {report && (
                <Button
                  data-ocid="risk_reset_button"
                  type="button"
                  variant="ghost"
                  size="lg"
                  className="rounded-full"
                  onClick={reset}
                >
                  New assessment
                </Button>
              )}
            </div>

            {assess.isError && (
              <p
                data-ocid="risk_error_state"
                className="mt-4 text-sm text-destructive"
              >
                We couldn&apos;t generate your report. Please check your inputs
                and try again.
              </p>
            )}

            <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
              ArteriQ provides preliminary screening insights only and is not a
              medical diagnosis. Always consult a qualified healthcare
              professional for any health concerns.
            </p>
          </form>
        </motion.div>

        {assess.isPending && (
          <div
            data-ocid="risk_loading_state"
            className="mt-8 flex items-center justify-center gap-3 rounded-3xl glass p-8 text-muted-foreground"
          >
            <Loader2 className="size-5 animate-spin text-primary" />
            Analysing your readings…
          </div>
        )}

        {report && assessment && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8"
          >
            <RiskReport report={report} assessment={assessment} />

            {/* Save to account */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-3xl glass p-5">
              <div className="min-w-0">
                <p className="font-display text-base tracking-wide text-foreground">
                  Save this report to your account
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isAuthenticated
                    ? "Keep a private copy of this preliminary screening report."
                    : "Sign in to keep a private copy of this preliminary screening report."}
                </p>
              </div>
              <Button
                data-ocid="report_save_button"
                type="button"
                size="lg"
                className="rounded-full px-6"
                disabled={
                  !token || saveReport.isPending || saveReport.isSuccess
                }
                onClick={() => {
                  if (!token) return;
                  saveReport.mutate({ token, report });
                }}
              >
                {saveReport.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving…
                  </>
                ) : saveReport.isSuccess ? (
                  <>
                    <Check className="size-4" />
                    Saved to account
                  </>
                ) : (
                  <>
                    <Bookmark className="size-4" />
                    Save to account
                  </>
                )}
              </Button>
              {saveReport.isError && (
                <p
                  data-ocid="report_save_error"
                  className="w-full text-sm text-destructive"
                >
                  We couldn&apos;t save your report. Please try again.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
