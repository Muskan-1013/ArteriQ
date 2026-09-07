import {
  Activity,
  Brain,
  HeartPulse,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

import { PipelineSection } from "@/components/PipelineSection";
import { ProcessSection } from "@/components/ProcessSection";
import { RiskAssessmentSection } from "@/components/RiskAssessmentSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const FEATURES = [
  {
    icon: HeartPulse,
    title: "Non-invasive screening",
    body: "A portable, non-invasive cardiovascular risk-screening system designed for comfortable, everyday use.",
  },
  {
    icon: Brain,
    title: "AI-assisted analysis",
    body: "Preliminary screening with AI-assisted signal analysis to surface cardiovascular risk indicators early.",
  },
  {
    icon: ShieldCheck,
    title: "Clinically minded",
    body: "Built alongside medical professionals to support proactive, hopeful conversations about heart health.",
  },
];

const CONTACT_DETAILS = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@arteriq.health",
    href: "mailto:hello@arteriq.health",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+1 (555) 012-3456",
    href: "tel:+15550123456",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Cardiovascular Innovation Lab",
    href: undefined,
  },
];

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/**
 * ArteriQ Home page — the main landing content in strict order:
 *   1. Hero Panel (Measure. Process. Assess. Protect.)
 *   2. What is ArteriQ
 *   3. How ArteriQ Works (PipelineSection)
 *   4. Detailed Process Explanation (ProcessSection)
 *   5. Risk Assessment (RiskAssessmentSection)
 *   6. Contact Us (contact info + glassmorphism contact form)
 */
export function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="relative">
      {/* 1. Hero Panel */}
      <section
        id="home"
        data-ocid="hero_section"
        className="relative scroll-mt-24 overflow-hidden px-4 pt-10 sm:pt-16"
      >
        <div className="relative mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs font-medium tracking-wide text-secondary-foreground">
              <Sparkles className="size-3.5" />✦ PRELIMINARY SCREENING · BY
              DESIGN
            </span>
            <h1 className="mt-6 font-display text-5xl leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Your heart, <span className="text-primary">understood</span> early
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              ArteriQ is a portable, non-invasive cardiovascular risk-screening
              system that helps you understand your heart health early — so you
              can have informed, hopeful conversations with your clinician.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button
                data-ocid="hero_cta"
                size="lg"
                className="rounded-full px-8"
                onClick={() => scrollToSection("about")}
              >
                Learn more
              </Button>
              <Button
                data-ocid="hero_secondary"
                variant="outline"
                size="lg"
                className="rounded-full px-8"
                onClick={() => scrollToSection("contact")}
              >
                Contact us
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. What is ArteriQ */}
      <section
        id="about"
        data-ocid="about_section"
        className="scroll-mt-24 px-4 pt-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs font-medium text-secondary-foreground">
              <HeartPulse className="size-3.5" />
              What is ArteriQ
            </span>
            <h2 className="mt-5 font-display text-3xl tracking-tight text-foreground sm:text-4xl">
              Screening that starts a conversation
            </h2>
            <p className="mt-4 text-muted-foreground">
              ArteriQ is a portable, multi-sensor cardiovascular risk-screening
              system. It brings together thoughtful engineering and clinical
              insight to make preliminary screening more accessible.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                data-ocid={`feature_card_${i + 1}`}
                className="glass rounded-3xl p-7"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <feature.icon className="size-6" />
                </div>
                <h3 className="mt-5 font-display text-xl tracking-tight text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {feature.body}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            data-ocid="about_overview"
            className="glass-strong mt-8 rounded-3xl p-8 sm:p-10"
          >
            <div className="grid items-center gap-8 lg:grid-cols-2">
              <div>
                <h3 className="font-display text-2xl tracking-tight text-foreground">
                  A complete, portable system
                </h3>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  ArteriQ captures ECG, heart rate, SpO₂ and temperature through
                  dedicated non-invasive sensors — AD8232, MAX30100 and DS18B20
                  — processed on an ESP32. AI-assisted analysis then classifies
                  your preliminary risk as Low, Moderate or High, presented in a
                  clear web dashboard.
                </p>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  ArteriQ provides preliminary screening insights only and is
                  not a medical diagnosis. Always consult a qualified healthcare
                  professional for any health concerns.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    icon: HeartPulse,
                    title: "Portable",
                    body: "Designed for comfortable everyday use.",
                  },
                  {
                    icon: Activity,
                    title: "Preliminary",
                    body: "Early risk indicators, not a diagnosis.",
                  },
                  {
                    icon: Brain,
                    title: "AI-assisted",
                    body: "Signal analysis to surface patterns.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Private",
                    body: "Your health data stays protected.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl bg-secondary/50 p-5"
                  >
                    <item.icon className="size-5 text-primary" />
                    <h4 className="mt-3 font-display text-lg text-foreground">
                      {item.title}
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. How ArteriQ Works */}
      <PipelineSection />

      {/* 4. Detailed Process Explanation */}
      <ProcessSection />

      {/* 5. Risk Assessment */}
      <RiskAssessmentSection />

      {/* 6. Contact Us */}
      <section
        id="contact"
        data-ocid="contact_section"
        className="scroll-mt-24 px-4 pt-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs font-medium text-secondary-foreground">
              <MessageSquare className="size-3.5" />
              Contact us
            </span>
            <h2 className="mt-5 font-display text-3xl tracking-tight text-foreground sm:text-4xl">
              Have questions about ArteriQ?
            </h2>
            <p className="mt-4 text-muted-foreground">
              Our team is here to help you understand how preliminary screening
              could support your heart-health journey.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-5">
            {/* Contact information */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              data-ocid="contact_info"
              className="glass rounded-3xl p-7 lg:col-span-2"
            >
              <h3 className="font-display text-xl tracking-tight text-foreground">
                Get in touch
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Reach out with any questions about ArteriQ, preliminary
                screening, or how the system could support your heart-health
                journey.
              </p>
              <div className="mt-6 space-y-4">
                {CONTACT_DETAILS.map((detail) => (
                  <div key={detail.label} className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <detail.icon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {detail.label}
                      </p>
                      {detail.href ? (
                        <a
                          href={detail.href}
                          className="mt-0.5 block text-sm font-medium text-foreground underline-offset-4 hover:underline"
                        >
                          {detail.value}
                        </a>
                      ) : (
                        <p className="mt-0.5 text-sm font-medium text-foreground">
                          {detail.value}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Contact form */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.6,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              data-ocid="contact_form_panel"
              className="glass-strong rounded-3xl p-7 sm:p-8 lg:col-span-3"
            >
              {submitted ? (
                <div
                  data-ocid="contact_success"
                  className="flex h-full flex-col items-center justify-center py-10 text-center"
                >
                  <div className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
                    <ShieldCheck className="size-7" />
                  </div>
                  <h3 className="mt-5 font-display text-2xl tracking-tight text-foreground">
                    Thank you, {name || "friend"}
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                    Your message has been received. Our team will get back to
                    you shortly to help with your heart-health questions.
                  </p>
                  <Button
                    data-ocid="contact_send_another"
                    variant="outline"
                    className="mt-6 rounded-full px-6"
                    onClick={() => {
                      setSubmitted(false);
                      setName("");
                      setEmail("");
                      setMessage("");
                    }}
                  >
                    Send another message
                  </Button>
                </div>
              ) : (
                <form
                  data-ocid="contact_form"
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name">Full name</Label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="contact-name"
                          data-ocid="contact_name_input"
                          name="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Jane Doe"
                          className="pl-9"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">Email address</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="contact-email"
                          data-ocid="contact_email_input"
                          name="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="jane@example.com"
                          className="pl-9"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-message">Your message</Label>
                    <div className="relative">
                      <MessageSquare className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground" />
                      <Textarea
                        id="contact-message"
                        data-ocid="contact_message_input"
                        name="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us how we can help…"
                        className="min-h-32 pl-9"
                        required
                      />
                    </div>
                  </div>
                  <Button
                    data-ocid="contact_submit_button"
                    type="submit"
                    size="lg"
                    className="w-full rounded-full"
                  >
                    Send message
                  </Button>
                  <p className="text-center text-xs leading-relaxed text-muted-foreground">
                    We respect your privacy. Your details are used only to
                    respond to your enquiry.
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
