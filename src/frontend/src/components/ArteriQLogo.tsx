import { cn } from "@/lib/utils";

interface ArteriQLogoProps {
  /** Size of the square logo box in pixels. */
  size?: number;
  className?: string;
  /** Accessible label for the logo mark. */
  label?: string;
}

/**
 * ArteriQ adaptive logo — connected "AQ" letters with a sharp thin ECG
 * waveform running through the centre of the Q. Rendered as a clean SVG
 * vector whose stroke colour adapts for contrast (wine on light, white on
 * dark, highest-contrast on mid-tones) via the `.arteriq-logo` CSS rule.
 */
export function ArteriQLogo({
  size = 48,
  className,
  label = "ArteriQ",
}: ArteriQLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={label}
      className={cn("arteriq-logo", className)}
    >
      <defs>
        <linearGradient
          id="aq-grad"
          x1="0"
          y1="0"
          x2="64"
          y2="64"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.72" />
        </linearGradient>
      </defs>

      {/* A — left letterform */}
      <path
        d="M10 46 L20 18 L30 46"
        stroke="url(#aq-grad)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 37 H25.5"
        stroke="url(#aq-grad)"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Q — right letterform (circle + tail) */}
      <circle cx="42" cy="32" r="14" stroke="url(#aq-grad)" strokeWidth="5" />
      <path
        d="M50 40 L57 47"
        stroke="url(#aq-grad)"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* ECG waveform running through the centre of the Q */}
      <path
        d="M28 32 H34 L37 26 L41 38 L44 30 L47 32 H56"
        stroke="url(#aq-grad)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
