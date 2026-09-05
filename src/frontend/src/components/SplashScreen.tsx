import { motion } from "motion/react";

import { ArteriQLogo } from "@/components/ArteriQLogo";

interface SplashScreenProps {
  /** Accessible label for the splash. */
  label?: string;
}

/**
 * First splash — a full-screen centred ArteriQ logo shown briefly on load,
 * then faded out to reveal the Login / Sign-Up screen.
 */
export function SplashScreen({ label = "ArteriQ" }: SplashScreenProps) {
  return (
    <motion.div
      data-ocid="splash_screen"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      aria-label={label}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.86 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center"
      >
        <ArteriQLogo size={120} />
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mt-5 font-display text-3xl tracking-wide text-foreground"
        >
          ArteriQ
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
