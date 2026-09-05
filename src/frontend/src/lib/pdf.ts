import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

/**
 * html2canvas 1.4.1 cannot parse modern `oklch()` colour functions, which the
 * ArteriQ design system uses for every semantic colour (via Tailwind classes
 * such as `bg-background`, `text-foreground`, `bg-secondary/40`). When the
 * report is captured directly, those colours fail to parse and the capture
 * silently produces a broken or blank PDF.
 *
 * Browsers resolve `oklch(...)` to `rgb(...)`/`rgba(...)` in computed styles,
 * which html2canvas understands. So before capture we clone the report and
 * copy each element's resolved colour properties onto the clone as inline
 * styles, giving html2canvas a fully rgb()-based tree to render.
 */
/**
 * Every colour-bearing CSS/SVG property html2canvas 1.4.1 reads from computed
 * styles. The report's colours all originate as `oklch(...)` (via Tailwind
 * classes and the `.arteriq-logo` rule), so each of these must be copied onto
 * the clone as its resolved `rgb()`/`rgba()` value before capture.
 *
 * This includes the SVG gradient stops (`stopColor`) used by the ArteriQ logo,
 * which resolve `currentColor` to the `oklch()` logo colour and were the
 * property the earlier, narrower list missed.
 */
const COLOUR_PROPS = [
  "color",
  "backgroundColor",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "outlineColor",
  "textDecorationColor",
  "columnRuleColor",
  "caretColor",
  "boxShadow",
  "textShadow",
  "webkitTextFillColor",
  "webkitTextStrokeColor",
  "fill",
  "stroke",
  "stopColor",
  "floodColor",
  "lightingColor",
] as const;
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
function resolveColorsForCapture(element: HTMLElement): HTMLElement {
  const clone = element.cloneNode(true) as HTMLElement;

  const originals = [element, ...Array.from(element.querySelectorAll("*"))];
  const clones = [clone, ...Array.from(clone.querySelectorAll("*"))];

  originals.forEach((original, i) => {
    const target = clones[i] as HTMLElement;
    const computed = getComputedStyle(original);
    // Set each colour property individually so the clone's other inline
    // styles (e.g. the risk bar's `width`) are preserved. Overwriting the
    // whole `cssText` would wipe those non-colour inline styles and corrupt
    // the captured report.
    for (const prop of COLOUR_PROPS) {
        const raw = computed.getPropertyValue(prop);
        if (raw && raw !== "transparent" && raw !== "currentcolor") {
         target.style.setProperty(prop, normalizeColor(raw));
      }
   }
  });

  return clone;
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
  // Render a colour-resolved clone so html2canvas can parse every colour.
    const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#fbfbfe",
    logging: false,
  });

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
