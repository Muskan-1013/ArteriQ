import {
  Activity,
  ArrowRight,
  Brain,
  ClipboardCheck,
  FileText,
  Gauge,
  ScanLine,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { cn } from "@/lib/utils";

interface PipelineStep {
  id: string;
  label: string;
  icon: typeof Activity;
  description: string;
}

const STEPS: PipelineStep[] = [
  {
    id: "measure",
    label: "Measure",
    icon: Gauge,
    description:
      "A portable, non-invasive sensor captures your cardiovascular signals comfortably and safely.",
  },
  {
    id: "acquire",
    label: "Acquire",
    icon: ScanLine,
    description:
      "The captured signal is digitised and prepared for analysis with care and precision.",
  },
  {
    id: "process",
    label: "Process",
    icon: Activity,
    description:
      "Signal quality is refined and cleaned so the data behind your screening is dependable.",
  },
  {
    id: "analyze",
    label: "Analyze",
    icon: Brain,
    description:
      "AI-assisted analysis surfaces early cardiovascular risk indicators from the signal.",
  },
  {
    id: "assess",
    label: "Assess",
    icon: ClipboardCheck,
    description:
      "Indicators are weighed against clinical insight to form a clear preliminary picture.",
  },
  {
    id: "report",
    label: "Report",
    icon: FileText,
    description:
      "A clear, hopeful summary is prepared for you to discuss with your clinician.",
  },
];

const STEP_COUNT = STEPS.length;
const START_ANGLE = -90; // start at the top (12 o'clock)

function polarToCartesian(
  radius: number,
  angleDeg: number,
  center: number,
): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: center + radius * Math.cos(rad),
    y: center + radius * Math.sin(rad),
  };
}

/**
 * "How ArteriQ Works" — an interactive circular pipeline. Six identical step
 * circles are placed with perfect mathematical symmetry on the circumference
 * of a single centred circle. Hovering or tapping a step highlights it with a
 * premium animation and reveals a short description in the centre.
 */
export function PipelineSection() {
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeStep = STEPS.find((step) => step.id === activeId) ?? null;

  // Fixed geometry so the circle is always a perfect circle (never an oval).
  const viewSize = 560;
  const center = viewSize / 2;
  const ringRadius = 190;
  const stepRadius = 62;

  const positions = STEPS.map((step, i) => {
    const angle = START_ANGLE + (360 / STEP_COUNT) * i;
    return {
      ...step,
      angle,
      pos: polarToCartesian(ringRadius, angle, center),
    };
  });

  return (
    <section
      id="pipeline"
      data-ocid="pipeline_section"
      className="scroll-mt-24 px-4 pt-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
            How ArteriQ works
          </h2>
          <p className="mt-4 text-muted-foreground">
            A clear, six-step journey from measurement to a preliminary
            screening report — designed to be simple, hopeful and precise.
          </p>
        </div>

        <div className="mt-12 flex justify-center">
          <div className="relative w-full max-w-[560px]">
            <svg
              viewBox={`0 0 ${viewSize} ${viewSize}`}
              className="h-auto w-full"
              role="img"
              aria-label="ArteriQ pipeline: Measure, Acquire, Process, Analyze, Assess, Report arranged in a circle"
            >
              <title>ArteriQ Pipeline</title>

              {/* Step circles */}
              {positions.map((step) => {
                const isActive = step.id === activeId;
                return (
                  <g key={step.id}>
                    <motion.circle
                      cx={step.pos.x}
                      cy={step.pos.y}
                      r={stepRadius}
                      fill={
                        isActive
                          ? "oklch(0.32 0.11 20 / 0.12)"
                          : "oklch(0.99 0.006 285 / 0.6)"
                      }
                      stroke={
                        isActive
                          ? "oklch(0.32 0.11 20 / 0.9)"
                          : "oklch(0.32 0.11 20 / 0.25)"
                      }
                      strokeWidth={isActive ? 2.5 : 1.5}
                      animate={{
                        scale: isActive ? 1.06 : 1,
                        strokeWidth: isActive ? 2.5 : 1.5,
                      }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      style={{ cursor: "pointer" }}
                    />
                    {/* Invisible larger hit target for touch */}
                    <circle
                      cx={step.pos.x}
                      cy={step.pos.y}
                      r={stepRadius + 14}
                      fill="transparent"
                      style={{ cursor: "pointer" }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Interactive overlay — step buttons + centre badge */}
            <div className="absolute inset-0">
              {positions.map((step, i) => (
                <button
                  key={step.id}
                  type="button"
                  data-ocid={`pipeline_step_${i + 1}`}
                  aria-pressed={step.id === activeId}
                  aria-label={`${step.label} — ${step.description}`}
                  onClick={() =>
                    setActiveId((current) =>
                      current === step.id ? null : step.id,
                    )
                  }
                  className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  style={{
                    left: `${(step.pos.x / viewSize) * 100}%`,
                    top: `${(step.pos.y / viewSize) * 100}%`,
                    width: `${((stepRadius * 2 * 1.06) / viewSize) * 100}%`,
                    height: `${((stepRadius * 2 * 1.06) / viewSize) * 100}%`,
                  }}
                >
                  <motion.div
                    className="flex h-full w-full flex-col items-center justify-center rounded-full border border-border bg-card/70 backdrop-blur-md"
                    animate={{
                      scale: step.id === activeId ? 1.06 : 1,
                      boxShadow:
                        step.id === activeId
                          ? "0 20px 50px -20px oklch(0.32 0.11 20 / 0.5)"
                          : "0 8px 30px -12px oklch(0.12 0.02 285 / 0.25)",
                    }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <step.icon
                      className={cn(
                        "size-6 transition-colors sm:size-7",
                        step.id === activeId
                          ? "text-primary"
                          : "text-muted-foreground",
                      )}
                    />
                    <span
                      className={cn(
                        "mt-1 px-1 text-center font-display text-[11px] leading-tight tracking-wide sm:text-xs",
                        step.id === activeId
                          ? "text-primary"
                          : "text-foreground",
                      )}
                    >
                      {step.label}
                    </span>
                  </motion.div>
                </button>
              ))}

              {/* Centre badge */}
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: "50%",
                  top: "50%",
                  width: `${((ringRadius * 2 - stepRadius * 2 - 20) / viewSize) * 100}%`,
                  height: `${((ringRadius * 2 - stepRadius * 2 - 20) / viewSize) * 100}%`,
                }}
              >
                <div className="flex h-full w-full flex-col items-center justify-center rounded-full border border-border bg-background/70 text-center backdrop-blur-md">
                  <AnimatePresence mode="wait">
                    {activeStep ? (
                      <motion.div
                        key={activeStep.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-col items-center px-6"
                      >
                        <activeStep.icon className="size-6 text-primary" />
                        <p className="mt-2 font-display text-lg tracking-wide text-foreground">
                          {activeStep.label}
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                          {activeStep.description}
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="default"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center px-6"
                      >
                        <p className="font-display text-xl tracking-wide text-gradient sm:text-2xl">
                          ARTERIQ
                        </p>
                        <p className="mt-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                          Pipeline
                        </p>
                        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                          Tap a step to explore
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-friendly step list fallback */}
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step, i) => (
            <button
              key={step.id}
              type="button"
              data-ocid={`pipeline_list_step_${i + 1}`}
              onClick={() => setActiveId(step.id)}
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors",
                step.id === activeId
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-card/50 hover:bg-card",
              )}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <step.icon className="size-4" />
              </span>
              <span className="font-display text-sm tracking-wide text-foreground">
                {step.label}
              </span>
              <ArrowRight className="ml-auto size-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
