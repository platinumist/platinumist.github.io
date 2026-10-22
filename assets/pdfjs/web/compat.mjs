const previousButton = document.getElementById("previous");
const nextButton = document.getElementById("next");
const pageInput = document.getElementById("page-number");
const pageTotal = document.getElementById("page-total");
const zoomInput = document.getElementById("zoom");
const status = document.getElementById("status");
const area = document.getElementById("page-area");
const canvas = document.getElementById("page-canvas");

let pdfDocument;
let currentPage = 1;
let rendering = false;
let resizePending = false;
let resizeTimer;
let areaWidth = area.clientWidth;

function updateControls() {
  previousButton.disabled = rendering || !pdfDocument || currentPage === 1;
  nextButton.disabled = rendering || !pdfDocument || currentPage === pdfDocument.numPages;
  pageInput.disabled = rendering || !pdfDocument;
  zoomInput.disabled = rendering || !pdfDocument;
  pageInput.value = currentPage;
}

function showError(error) {
  console.error("PDF compatibility viewer:", error);
  status.textContent = "PDF 预览失败，请刷新重试或在其他浏览器打开本页。";
  status.setAttribute("data-error", "");
}

async function renderPage() {
  if (!pdfDocument) return;
  if (rendering) {
    resizePending = true;
    return;
  }

  rendering = true;
  updateControls();
  status.removeAttribute("data-error");
  status.textContent = `正在显示第 ${currentPage} 页…`;

  try {
    const page = await pdfDocument.getPage(currentPage);
    const naturalViewport = page.getViewport({ scale: 1 });
    const scale = zoomInput.value === "fit"
      ? Math.max(0.1, (area.clientWidth - 32) / naturalViewport.width)
      : Number(zoomInput.value);
    const viewport = page.getViewport({ scale });

    // 限制单页画布内存，翻页时复用同一个画布。
    const pixelRatio = Math.min(
      window.devicePixelRatio || 1,
      2,
      Math.sqrt(5242880 / (viewport.width * viewport.height)),
    );
    canvas.width = Math.max(1, Math.ceil(viewport.width * pixelRatio));
    canvas.height = Math.max(1, Math.ceil(viewport.height * pixelRatio));
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;
    canvas.hidden = false;

    await page.render({
      canvasContext: canvas.getContext("2d", { alpha: false }),
      viewport,
      transform: [pixelRatio, 0, 0, pixelRatio, 0, 0],
      background: "#ffffff",
    }).promise;

    canvas.setAttribute("aria-label", `PDF 第 ${currentPage} 页，共 ${pdfDocument.numPages} 页`);
    status.textContent = "";
    window.history.replaceState(null, "", `#page=${currentPage}`);
    page.cleanup();
  } catch (error) {
    showError(error);
  } finally {
    rendering = false;
    updateControls();
    if (resizePending) {
      resizePending = false;
      renderPage();
    }
  }
}

function goToPage(value) {
  if (!pdfDocument || rendering) return;
  const number = Number(value);
  if (!Number.isInteger(number)) {
    pageInput.value = currentPage;
    return;
  }
  currentPage = Math.min(pdfDocument.numPages, Math.max(1, number));
  area.scrollLeft = 0;
  area.scrollTop = 0;
  window.scrollTo(0, 0);
  renderPage();
}

previousButton.addEventListener("click", () => goToPage(currentPage - 1));
nextButton.addEventListener("click", () => goToPage(currentPage + 1));
pageInput.addEventListener("change", () => goToPage(pageInput.value));
pageInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    goToPage(pageInput.value);
    pageInput.blur();
  }
});
zoomInput.addEventListener("change", renderPage);
window.addEventListener("resize", () => {
  if (area.clientWidth === areaWidth) return;
  areaWidth = area.clientWidth;
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (zoomInput.value === "fit") renderPage();
  }, 150);
});

async function openDocument() {
  const file = new URLSearchParams(window.location.search).get("file");
  if (!file) throw new Error("Missing PDF file parameter");
  const fileUrl = new URL(file, window.location.href);
  if (fileUrl.origin !== window.location.origin) {
    throw new Error("The PDF file must use the same origin as the viewer");
  }

  const { getDocument, GlobalWorkerOptions } = await import("../build/pdf.mjs");
  GlobalWorkerOptions.workerSrc = new URL("../build/pdf.worker.mjs", import.meta.url).href;
  pdfDocument = await getDocument({
    url: fileUrl.href,
    cMapUrl: new URL("cmaps/", import.meta.url).href,
    cMapPacked: true,
    standardFontDataUrl: new URL("standard_fonts/", import.meta.url).href,
    wasmUrl: new URL("wasm/", import.meta.url).href,
    // 使用字体轮廓和主线程图像解码，减少对浏览器新增接口的依赖。
    disableFontFace: true,
    useSystemFonts: false,
    isOffscreenCanvasSupported: false,
    isImageDecoderSupported: false,
    useWasm: false,
  }).promise;

  pageTotal.textContent = pdfDocument.numPages;
  pageInput.max = pdfDocument.numPages;
  const initialPage = Number(new URLSearchParams(window.location.hash.slice(1)).get("page"));
  currentPage = Number.isInteger(initialPage) && initialPage > 0
    ? Math.min(pdfDocument.numPages, initialPage)
    : 1;
  await renderPage();
}

openDocument().catch(showError);
