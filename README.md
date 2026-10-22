# platinumist.github.io

个人学习资料库：<https://platinumist.github.io/>。

## 修改位置

| 内容 | 文件 |
| --- | --- |
| 首页介绍、课程索引 | `docs/index.md` |
| 配色、字体、排版 | `docs/assets/stylesheets/archive.css` |
| 导航、主题配置 | `mkdocs.yml` |
| 课程说明、章节页面 | `docs/` 下的 Markdown 文件 |
| PDF | `docs/assets/pdfs/` |

CSS 开头定义颜色与字体；后续按导航、正文、表格、PDF、首页等区段排列。

## 本地预览

安装 Python 3.12 后，在仓库根目录用 PowerShell 执行：

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m mkdocs serve --dev-addr 127.0.0.1:8000
```

打开 <http://127.0.0.1:8000/>。保存文件后页面自动刷新，按 `Ctrl+C` 停止预览。

以后预览只需执行最后一条命令。

## 构建与发布

```powershell
.\.venv\Scripts\python.exe -m mkdocs build --strict
git status --short
git diff
```

构建通过后，提交需要发布的源文件并推送到 `main`。GitHub Actions 自动发布到 GitHub Pages。

本地和 CI 使用 `requirements.txt` 中的同一组版本。`.venv/` 和 `site/` 由 Git 忽略。

## PDF 浏览器兼容

PDF 使用仓库内完整的 PDF.js 查看器，手机上的保存按钮位于右上角的“工具”菜单。保存的是原始 PDF。

查看器加载 `docs/assets/pdfjs/web/viewer-compatible.css`，由原始 `viewer.css` 和本站的 `viewer-overrides.css` 转换而来，展开嵌套选择器并转换颜色语法。窄屏隐藏批注工具，为阅读和保存菜单留出位置。`build/pdf.mjs` 的 `setLayerDimensions` 为不支持 CSS `round()` 的浏览器改用 `calc()` 设置页面尺寸。

日常修改笔记仍按上面的 MkDocs 流程操作。仅升级 PDF.js 或修改上述查看器样式时，需要安装 Node.js、pnpm 并重新生成兼容样式：

```powershell
pnpm --dir tools install --frozen-lockfile
pnpm --dir tools run build:pdf-css
```

生成的 CSS 随仓库提交，网站构建不需要 Node.js。升级 PDF.js 时也要重新检查并保留上述尺寸补丁。
