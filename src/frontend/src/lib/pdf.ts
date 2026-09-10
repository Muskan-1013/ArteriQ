import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

/**
 * Captures a DOM node (the rendered Risk Report) as a high-quality PDF that
 * preserves the report's layout, colours, typography and branding.
 *
 * html2canvas-pro (unlike the base html2canvas library) understands modern
 * CSS colour functions such as oklch(), so the report can be captured
 * directly with no colour/style pre-processing.
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
