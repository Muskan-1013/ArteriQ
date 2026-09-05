import {
  Activity,
  Brain,
  ClipboardCheck,
  Cpu,
  FileText,
  Gauge,
  HeartPulse,
  ScanLine,
  Thermometer,
  Waves,
} from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

interface ProcessStage {
  icon: typeof Activity;
  title: string;
  body: string;
  detail: string;
}

const STAGES: ProcessStage[] = [
  {
    icon: Gauge,
    title: "Measure",
    body: "A portable multi-sensor system gathers your cardiovascular signals non-invasively.",
    detail:
      "ECG (AD8232), heart rate and SpO₂ (MAX30100), and temperature (DS18B20) are captured comfortably at the point of care.",
  },
  {
    icon: ScanLine,
    title: "Acquire",
    body: "The captured signal is digitised and prepared for analysis with care and precision.",
    detail:
      "Raw sensor readings are sampled and organised so every measurement is ready for dependable downstream processing.",
  },
  {
    icon: Cpu,
    title: "Process",
    body: "An ESP32 microcontroller digitises and cleans the raw signal in real time.",
    detail:
      "Signal quality is refined on the device so the data behind your screening is dependable and consistent.",
  },
  {
    icon: Brain,
    title: "Analyze",
    body: "AI-assisted analysis weighs the signal against clinical insight.",
    detail:
      "The system classifies your preliminary risk as Low, Moderate, or High to guide a hopeful conversation with your clinician.",
  },
  {
    icon: ClipboardCheck,
    title: "Assess",
    body: "Indicators are weighed against clinical insight to form a clear preliminary picture.",
    detail:
      "Each physiological parameter is reviewed against reference ranges to surface early cardiovascular risk indicators.",
  },
  {
    icon: FileText,
    title: "Report",
    body: "A clear, hopeful summary is prepared for you to discuss with your clinician.",
    detail:
      "Results are shown in an accessible web view you can review, download and share with your healthcare professional.",
  },
];

/**
 * "Detailed Process Explanation" — a deeper, step-by-step walkthrough of the
 * ArteriQ pipeline, from sensor capture through processing, AI classification
 * and the web dashboard. Emphasises that this is preliminary screening only.
 */
export function ProcessSection() {
  return (
    <section
      id="process"
      data-ocid="process_section"
      className="scroll-mt-24 px-4 pt-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs font-medium text-secondary-foreground">
            <Activity className="size-3.5" />
            Detailed process
          </span>
          <h2 className="mt-5 font-display text-3xl tracking-tight text-foreground sm:text-4xl">
            A closer look at how ArteriQ works
          </h2>
          <p className="mt-4 text-muted-foreground">
            From the sensors on your skin to the summary on your screen — here
            is the journey your cardiovascular signal takes, step by step.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {STAGES.map((stage, i) => (
            <motion.div
              key={stage.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.6,
                delay: i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              data-ocid={`process_stage_${i + 1}`}
              className="glass rounded-3xl p-7"
            >
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <stage.icon className="size-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-sm tracking-wide text-primary">
                      0{i + 1}
                    </span>
                    <h3 className="font-display text-xl tracking-tight text-foreground">
                      {stage.title}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {stage.body}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {stage.detail}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sensor chips */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          data-ocid="process_sensors"
          className="glass-strong mt-8 rounded-3xl p-7 sm:p-8"
        >
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <HeartPulse className="size-7" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-xl tracking-tight text-foreground">
                Multi-sensor by design
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                ArteriQ combines several non-invasive sensors into one portable
                system, giving a richer preliminary picture of your heart
                health.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Activity,
                label: "ECG",
                chip: "AD8232",
                body: "Electrical heart activity",
              },
              {
                icon: HeartPulse,
                label: "Heart rate & SpO₂",
                chip: "MAX30100",
                body: "Pulse and oxygen saturation",
              },
              {
                icon: Thermometer,
                label: "Temperature",
                chip: "DS18B20",
                body: "Skin temperature reading",
              },
              {
                icon: Cpu,
                label: "Processing",
                chip: "ESP32",
                body: "On-device signal handling",
              },
            ].map((sensor) => (
              <div
                key={sensor.label}
                data-ocid={`sensor_${sensor.label.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`}
                className="rounded-2xl border border-border bg-card/60 p-5"
              >
                <sensor.icon className="size-5 text-primary" />
                <p className="mt-3 font-display text-base tracking-wide text-foreground">
                  {sensor.label}
                </p>
                <p className="mt-0.5 font-mono text-xs text-accent">
                  {sensor.chip}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {sensor.body}
                </p>
              </div>
            ))}
          </div>

          <p
            className={cn(
              "mt-6 rounded-2xl bg-secondary/50 px-5 py-4 text-center text-sm leading-relaxed text-muted-foreground",
            )}
          >
            ArteriQ provides{" "}
            <span className="font-medium text-foreground">
              preliminary screening only
            </span>{" "}
            — it is not a medical diagnosis. Always discuss results with a
            qualified healthcare professional.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
