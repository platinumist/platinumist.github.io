/* PDF.js 6 查看器的 CSS 能力检测。compat=1 可手动使用简化预览。 */
(function () {
  var forceCompatibility = /[?&]compat=1(?:&|$)/.test(window.location.search);
  var supportsViewerStyles = window.CSS &&
    typeof window.CSS.supports === "function" &&
    window.CSS.supports("width", "round(down, 10px, 1px)") &&
    window.CSS.supports("color", "light-dark(black, white)");

  if (forceCompatibility || !supportsViewerStyles) {
    window.location.replace("compat.html" + window.location.search + window.location.hash);
  }
}());
