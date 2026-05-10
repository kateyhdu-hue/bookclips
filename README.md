# BookClips 摘书 - 云端 OCR + 框选版

这是一个实体书摘录 Web App 原型，支持上传/拍照后框选文字区域，并优先使用云端 OCR 识别。

## 新增功能

- OCR 引擎升级为“云端 OCR 优先 + 本地 Tesseract 备用”
- 通过 Vercel Serverless Function 调用 OCR.space，避免把 API key 暴露在前端
- 支持简体中文、繁体中文、英文
- 上传/拍照后可以框选文字区域，只识别框选部分
- 云端 OCR 失败时，会自动尝试本地 OCR

## 文件说明

```text
index.html      页面结构
styles.css      样式
app.js          前端逻辑
api/ocr.js      Vercel 云端 OCR 接口代理
package.json    项目信息
vercel.json     Vercel 配置
README.md       使用说明
```

## 部署到 Vercel

### 1. 上传到 GitHub

把本项目所有文件上传到你的 GitHub repository。

注意：请确保 `api/ocr.js` 也上传了。

### 2. 在 Vercel 导入 GitHub repo

- 打开 Vercel
- Add New Project
- 选择你的 GitHub repository
- Framework Preset 选择 Other
- Build Command 留空
- Output Directory 留空或填 `.`
- Deploy

### 3. 添加 OCR API Key

你需要申请 OCR.space API key：

https://ocr.space/ocrapi

然后在 Vercel 里设置：

```text
Project Settings
→ Environment Variables
→ Add New
```

添加：

```text
Name: OCR_SPACE_API_KEY
Value: 你的 OCR.space API key
```

保存后，重新 Deploy 一次。

## 本地开发

如果你只是双击打开 `index.html`，云端 OCR 不会工作，因为 `/api/ocr` 需要 Vercel serverless 环境。

本地调试云端 OCR 需要安装 Vercel CLI：

```bash
npm i -g vercel
vercel dev
```

并在本地配置环境变量。

## 注意事项

- 当前 OCR.space 适合 MVP 测试，准确度会比纯浏览器 Tesseract 通常更稳定，但仍不等于最终商业级效果。
- 如果要做正式产品，建议后续改为 Google Cloud Vision、Azure AI Vision、百度 OCR、腾讯云 OCR 或 iOS 原生 Live Text。
- 当前书摘数据仍保存在浏览器 localStorage 中，请定期导出 JSON 备份。
