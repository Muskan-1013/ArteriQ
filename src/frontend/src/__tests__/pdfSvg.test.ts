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

describe("downloadReportAsPdf SVG handling", () => {
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

  it("preserves nested SVG gradient stops on the capture clone", async () => {
    // The ArteriQ logo is an inline SVG whose gradient stops carry the brand
    // colour. The colour-resolution pass clones the whole tree, so the cloned
    // stop elements must survive for html2canvas to render the logo. (jsdom
    // does not resolve SVG presentation attributes like stop-color into
    // computed styles, so the colour value itself is not asserted here.)
    const el = document.createElement("div");
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const stop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop.setAttribute("stop-color", "rgb(16, 17, 18)");
    svg.appendChild(stop);
    el.appendChild(svg);
    document.body.appendChild(el);

    await downloadReportAsPdf(el);

    const captured = html2canvasMock.mock.calls[0][0] as HTMLElement;
    expect(captured).not.toBe(el);
    const clonedStop = captured.querySelector("stop");
    expect(clonedStop).not.toBeNull();
    expect(clonedStop?.getAttribute("stop-color")).toBe("rgb(16, 17, 18)");
  });

  it("runs the colour-resolution pass over an SVG-bearing tree without error", async () => {
    // The colour-resolution pass iterates every descendant (including SVG
    // elements) and reads their computed colour properties, so it must not
    // throw when the tree contains SVG nodes.
    const el = document.createElement("div");
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const stop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop.setAttribute("stop-color", "rgb(16, 17, 18)");
    svg.appendChild(stop);
    el.appendChild(svg);
    document.body.appendChild(el);

    await expect(downloadReportAsPdf(el)).resolves.toBeUndefined();
  });
});
