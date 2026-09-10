import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

/**
 * The ArteriQ design system defines every semantic colour as raw oklch
 * components in a CSS custom property (e.g. `--background: 0.985 0.005 285`)
 * and builds the final colour at the point of use with `oklch(var(--background))`.
 * html2canvas parses stylesheets itself rather than asking the browser to
 * resolve them, so it cannot expand `var(--background)` inside `oklch()` —
 * every themed background, border and text colour in the report is invisible
 * to it. `getComputedStyle`, on the other hand, always returns each
 * property's final resolved value, with all custom properties already
 * substituted in.
 *
 * To make the report reproducible by html2canvas we clone it and copy every
 * element's full computed style onto the clone as inline styles. That leaves
 * html2canvas nothing to parse or resolve — every box's size, spacing,
 * colour and border is already explicit rgb()/pt values on the element.
 */
let colorCanvasCtx: CanvasRenderingContext2D | null = null;

/**
 * Forces any valid CSS colour string through a canvas 2D context, which is
 * spec-guaranteed to always serialize colours back out as rgb()/rgba() —
 * unlike getComputedStyle, which in current browsers may return colours in
 * their original oklch()/lab()/etc. notation instead of resolving them.
 */
function normalizeColor(value: string): string {
  if (!colorCanvasCtx) {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    colorCanvasCtx = canvas.getContext("2d");
  }
  if (!colorCanvasCtx) return value;
  try {
    colorCanvasCtx.fillStyle = value;
    return colorCanvasCtx.fillStyle;
  } catch {
    return value;
  }
}

// Matches any modern colour function (oklch, oklab, lab, lch, color()) that
// html2canvas's own CSS parser cannot understand, wherever it appears inside
// a property value (e.g. nested inside a box-shadow or gradient stop).
const COLOR_FUNCTION_RE = /(?:oklch|oklab|lab|lch|color)\([^()]*\)/gi;

function normalizeColorFunctions(value: string): string {
  if (!value || !COLOR_FUNCTION_RE.test(value)) return value;
  COLOR_FUNCTION_RE.lastIndex = 0;
  return value.replace(COLOR_FUNCTION_RE, (match) => normalizeColor(match));
}

// html2canvas measures and draws text glyph-by-glyph itself rather than
// letting the browser do it, and it does this poorly for the custom
// variable/display webfonts this app uses (Montserrat, General Sans, Fjalla
// One, Figtree) — their kerning tables throw its per-character width
// estimate off, which is what causes letters and words to visually collide
// in the captured image. Custom fonts aren't essential to a PDF export, so
// we substitute a plain system font stack everywhere in the clone; this
// keeps sizes/weights/layout identical but gives html2canvas glyph metrics
// it can measure accurately.
const SAFE_FONT_STACK =
  '-apple-system, "Segoe UI", Arial, Helvetica, sans-serif';

function inlineComputedStyles(element: HTMLElement): HTMLElement {
  const clone = element.cloneNode(true) as HTMLElement;

  const originals = [element, ...Array.from(element.querySelectorAll("*"))];
  const clones = [clone, ...Array.from(clone.querySelectorAll("*"))];

  originals.forEach((original, i) => {
    const target = clones[i] as HTMLElement;
    const computed = getComputedStyle(original);
    const declarations: string[] = [];
    for (let p = 0; p < computed.length; p++) {
      const prop = computed.item(p);
      let value = computed.getPropertyValue(prop);
      if (!value) continue;
      if (prop === "font-family") value = SAFE_FONT_STACK;
      value = normalizeColorFunctions(value);
      declarations.push(`${prop}:${value}`);
    }
    // Apply computed styles first, then re-apply the element's own inline
    // style on top so app-set inline styles (e.g. the risk bar's `width`)
    // are preserved rather than overwritten by the computed-style dump.
    target.setAttribute("style", declarations.join(";"));
    if (original.getAttribute("style")) {
      for (const prop of Array.from(original.style)) {
        target.style.setProperty(
          prop,
          normalizeColorFunctions(original.style.getPropertyValue(prop)),
        );
      }
    }
  });

  return clone;
}

/**
 * Temporarily forces the report's viewport-width-dependent (`sm:`) styles
 * into their "desktop" state directly on the live element, so the capture
 * below always reflects the two-column layout regardless of how wide the
 * person's actual browser window is. Returns a function that restores the
 * original inline styles.
 */
function forceDesktopLayout(element: HTMLElement): () => void {
  const restores: Array<() => void> = [];

  const setProp = (
    el: HTMLElement,
    prop: string,
    value: string,
  ) => {
    const prev = el.style.getPropertyValue(prop);
    const prevPriority = el.style.getPropertyPriority(prop);
    el.style.setProperty(prop, value, "important");
    restores.push(() => {
      if (prev) {
        el.style.setProperty(prop, prev, prevPriority);
      } else {
        el.style.removeProperty(prop);
      }
    });
  };

  // The assessment-details grid: `grid-cols-1 sm:grid-cols-2`.
  element
    .querySelectorAll<HTMLElement>('[class*="sm:grid-cols-2"]')
    .forEach((el) => setProp(el, "grid-template-columns", "repeat(2, minmax(0, 1fr))"));

  // Each detail row hides its own separator border/padding at `sm:` and up.
  element.querySelectorAll<HTMLElement>('[class*="sm:border-0"]').forEach((el) => {
    setProp(el, "border-bottom-width", "0px");
  });
  element.querySelectorAll<HTMLElement>('[class*="sm:pb-0"]').forEach((el) => {
    setProp(el, "padding-bottom", "0px");
  });

  return () => restores.forEach((fn) => fn());
}

/**
 * Captures a DOM node (the rendered Risk Report) as a high-quality PDF that
 * preserves the report's layout, colours, typography and branding.
 *
 * The report is rendered to a canvas at 2x scale for crisp output, then
 * sliced into A4 portrait pages so no content is ever cut off. Each page is
 * scaled to fit the printable width while keeping the full height of the
 * captured slice.
 */
export async function downloadReportAsPdf(
  element: HTMLElement,
  filename = "arteriq-risk-report.pdf",
): Promise<void> {
  // Render a fully inlined clone so html2canvas never has to parse the app's
  // own stylesheet. The clone must be attached to the document (off-screen)
  // for it to compute layout correctly; it is removed right after capture.
  // The report's two-column detail grid only appears above Tailwind's `sm`
  // breakpoint, which is a real media query keyed off the browser window's
  // width — not the size of any container we could size in JS. So the PDF
  // would silently fall back to a single-column mobile layout whenever the
  // person downloads it from a narrow window. To keep the PDF layout
  // consistent regardless of window size, we temporarily force the relevant
  // elements into their desktop (`sm:`) layout on the live element itself
  // before reading computed styles, then restore them immediately after.
  const restoreDesktopLayout = forceDesktopLayout(element);
  let clone: HTMLElement;
  try {
    clone = inlineComputedStyles(element);
  } finally {
    restoreDesktopLayout();
  }

  clone.style.position = "fixed";
  clone.style.top = "0";
  clone.style.left = "-99999px";
  clone.style.width = `${Math.max(element.offsetWidth, 820)}px`;
  clone.style.zIndex = "-1";
  document.body.appendChild(clone);

  let canvas: HTMLCanvasElement;
  try {
    canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#fbfbfe",
      logging: false,
    });
  } finally {
    document.body.removeChild(clone);
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 32;

  const contentWidth = pageWidth - margin * 2;
  const contentHeight = pageHeight - margin * 2;

  const imgWidth = contentWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = margin;

  // First page
  pdf.addImage(
    canvas.toDataURL("image/jpeg", 0.95),
    "JPEG",
    margin,
    position,
    imgWidth,
    imgHeight,
  );
  heightLeft -= contentHeight;

  // Additional pages for any overflow — nothing is ever cut off.
  while (heightLeft > 0) {
    position =
      margin - contentHeight * (Math.ceil(imgHeight / contentHeight) - 1);
    pdf.addPage();
    pdf.addImage(
      canvas.toDataURL("image/jpeg", 0.95),
      "JPEG",
      margin,
      position,
      imgWidth,
      imgHeight,
    );
    heightLeft -= contentHeight;
  }

  pdf.save(filename);
}
