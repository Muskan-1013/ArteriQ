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

describe("downloadReportAsPdf pagination", () => {
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

  it("slices a tall report across multiple A4 pages so nothing is cut off", async () => {
    // The captured canvas is 1200px tall against an A4 content height of
    // 842 - 64 = 778pt, so the report overflows one page and must be sliced
    // onto additional pages rather than truncated.
    const el = document.createElement("div");
    document.body.appendChild(el);

    await downloadReportAsPdf(el);

    // addPage is called for every page beyond the first.
    expect(addPageMock).toHaveBeenCalled();
    // addImage is called once per page (first + overflow pages).
    expect(addImageMock.mock.calls.length).toBeGreaterThan(1);
    expect(saveMock).toHaveBeenCalledWith("arteriq-risk-report.pdf");
  });
});
