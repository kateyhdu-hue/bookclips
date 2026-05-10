# BookClips 摘书 - Google Vision OCR + AI 自动修正版

这是一个实体书摘录 Web App 原型，支持：

- 拍照/上传实体书页面
- 框选要识别的文字区域
- 使用 Google Vision `DOCUMENT_TEXT_DETECTION` 做密集文档 OCR
- 自动调用 OpenAI 修正 OCR 错字、断行、标点和噪音
- 自动分句并保存书摘
- 按书籍、页码、标签、笔记管理摘录
- 导出 JSON 备份

## 文件说明

```text
index.html       页面结构
styles.css       样式
app.js           前端逻辑
api/ocr.js       Vercel 后端：Google Vision OCR
api/clean.js     Vercel 后端：OpenAI 自动修正 OCR
package.json     项目信息
vercel.json      Vercel 配置
README.md        使用说明
```

## 你需要准备的 API Key

### 1. Google Vision API Key

在 Google Cloud 开通 Cloud Vision API，然后创建 API key。

需要放到 Vercel 环境变量：

```text
GOOGLE_VISION_API_KEY
```

### 2. OpenAI API Key

在 OpenAI Platform 创建 API key。

需要放到 Vercel 环境变量：

```text
OPENAI_API_KEY
```

可选：如果你想换模型，可以添加：

```text
OPENAI_MODEL
```

默认使用：

```text
gpt-4.1-mini
```

## 在 Vercel 设置 Environment Variables

进入：

```text
Vercel
→ 你的项目
→ Settings
→ Environment Variables
```

添加：

```text
GOOGLE_VISION_API_KEY = 你的 Google Vision API key
OPENAI_API_KEY = 你的 OpenAI API key
```

保存后重新部署：

```text
Deployments → Redeploy
```

## 部署到 Vercel

1. 把本项目上传到 GitHub repo
2. 在 Vercel 导入这个 GitHub repo
3. 设置上面的环境变量
4. Redeploy

## 重要说明

- 这版不再使用 OCR.space。
- Google Vision 的 `DOCUMENT_TEXT_DETECTION` 更适合密集文档/书页 OCR。
- AI 修正会自动发生，不会再询问用户。
- AI 修正可能会误改文字，所以前端仍然保留“查看原始 OCR 文本”，方便核对。
- 当前书摘仍保存在浏览器 localStorage，请定期导出 JSON。
