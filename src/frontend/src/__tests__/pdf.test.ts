import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { downloadReportAsPdf } from "@/lib/pdf";

const html2canvasMock = vi.fn();
const saveMock = vi.fn();
const addImageMock = vi.fn();
const addPageMock = vi.fn();

vi.mock("html2canvas", () => ({
  default: (element: HTMLElement, opts: unknown) => {
    html2canvasMock(element, opts);
    return Promise.resolve({
      width: 800,
      height: 1200,
      toDataURL: () => "data:image/jpeg;base64,xxx",
    });
  },
}));

vi.mock("jspdf", () => {
  class MockJsPDF {
    internal = {
      pageSize: { getWidth: () => 595, getHeight: () => 842 },
    };
    addImage = addImageMock;
    addPage = addPageMock;
    save = saveMock;
  }
  return { jsPDF: MockJsPDF };
});

describe("downloadReportAsPdf", () => {
  beforeEach(() => {
    html2canvasMock.mockClear();
    saveMock.mockClear();
    addImageMock.mockClear();
    addPageMock.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
  });

  it("captures a colour-resolved clone and saves a PDF", async () => {
    const el = document.createElement("div");
    el.style.color = "rgb(1, 2, 3)";
    el.style.backgroundColor = "rgb(4, 5, 6)";
    document.body.appendChild(el);

    await downloadReportAsPdf(el);

    // html2canvas receives a clone (not the original element) so the report's
    // own DOM is never mutated during capture.
    const captured = html2canvasMock.mock.calls[0][0] as HTMLElement;
    expect(captured).not.toBe(el);

    // The PDF is produced and saved under the default filename.
    expect(addImageMock).toHaveBeenCalled();
    expect(saveMock).toHaveBeenCalledWith("arteriq-risk-report.pdf");
  });

  it("removes the off-screen holder from the document after capture", async () => {
    const el = document.createElement("div");
    el.style.width = "400px";
    document.body.appendChild(el);

    await downloadReportAsPdf(el);

    // The temporary holder used to park the clone off-screen is cleaned up.
    const holder = Array.from(document.body.querySelectorAll("div")).find(
      (node) => node.style.position === "fixed",
    );
    expect(holder).toBeUndefined();
  });

  it("preserves non-colour inline styles on the captured clone", async () => {
    const el = document.createElement("div");
    // A non-colour inline style (e.g. the risk bar's width) must survive the
    // colour-resolution pass. The setProperty-per-colour approach copies only
    // colour properties and leaves other inline styles intact.
    el.style.width = "66%";
    el.style.color = "rgb(1, 2, 3)";
    document.body.appendChild(el);

    await downloadReportAsPdf(el);

    const captured = html2canvasMock.mock.calls[0][0] as HTMLElement;
    expect(captured).not.toBe(el);
    expect(captured.style.width).toBe("66%");
  });

  it("copies the expanded CSS colour properties onto the capture clone", async () => {
    // The colour-resolution pass must copy every colour-bearing CSS property
    // the report uses — including the shadow/outline properties added to
    // COLOUR_PROPS — so html2canvas receives a fully rgb()-resolved tree.
    // jsdom's getComputedStyle returns the inline value for each of these, so
    // set them on the source element and assert they land on the clone.
    const el = document.createElement("div");
    el.style.color = "rgb(1, 2, 3)";
    el.style.boxShadow = "0 1px 2px rgb(4, 5, 6)";
    el.style.textShadow = "1px 1px rgb(7, 8, 9)";
    el.style.caretColor = "rgb(10, 11, 12)";
    el.style.columnRuleColor = "rgb(13, 14, 15)";
    document.body.appendChild(el);

    await downloadReportAsPdf(el);

    const captured = html2canvasMock.mock.calls[0][0] as HTMLElement;
    expect(captured).not.toBe(el);

    // The expanded CSS colour properties are copied onto the clone.
    expect(captured.style.boxShadow).toBe("0 1px 2px rgb(4, 5, 6)");
    expect(captured.style.textShadow).toBe("1px 1px rgb(7, 8, 9)");
    expect(captured.style.caretColor).toBe("rgb(10, 11, 12)");
    expect(captured.style.columnRuleColor).toBe("rgb(13, 14, 15)");
  });

  it("never mutates the live report DOM during capture", async () => {
    // The colour-resolution pass works on a clone, so the report's own DOM
    // must be left untouched — its inline styles and attributes survive the
    // download unchanged.
    const el = document.createElement("div");
    el.style.color = "rgb(1, 2, 3)";
    el.style.width = "66%";
    el.setAttribute("data-ocid", "risk_report");
    document.body.appendChild(el);

    await downloadReportAsPdf(el);

    expect(el.style.color).toBe("rgb(1, 2, 3)");
    expect(el.style.width).toBe("66%");
    expect(el.getAttribute("data-ocid")).toBe("risk_report");
    // The original element is still in the document (only the clone's holder
    // is removed).
    expect(document.body.contains(el)).toBe(true);
  });

  it("captures at 2x scale with the report background colour", async () => {
    const el = document.createElement("div");
    document.body.appendChild(el);

    await downloadReportAsPdf(el);

    // html2canvas is invoked with the crisp 2x scale and the report's
    // background colour so the PDF is not transparent or blurry.
    const opts = html2canvasMock.mock.calls[0][1] as {
      scale: number;
      backgroundColor: string;
    };
    expect(opts.scale).toBe(2);
    expect(opts.backgroundColor).toBe("#fbfbfe");
  });
});
