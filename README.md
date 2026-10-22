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

`docs/assets/pdfjs/web/compatibility.js` 检查查看器所需的 CSS 能力；缺少支持时自动使用 `compat.html` 简化预览，支持翻页与缩放。

简化预览的界面和绘制逻辑分别在 `compat.css`、`compat.mjs`，使用仓库内同一份 PDF.js 和 PDF。普通查看器地址加上 `&compat=1` 可手动测试，例如：

```text
/assets/pdfjs/web/viewer.html?file=../../pdfs/physical-chemistry/ch01.pdf&compat=1
```
