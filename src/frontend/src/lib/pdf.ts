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
  const clone = inlineComputedStyles(element);
  clone.style.position = "fixed";
  clone.style.top = "0";
  clone.style.left = "-99999px";
  clone.style.width = `${element.offsetWidth}px`;
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
