# BookClips v2 App-style Release

更接近手机书摘 App 的完整版本。

## 功能

- 底部 Tab：书摘 / 书架 / 摘录 / 标签 / 我的
- 书摘卡片流
- 书架管理
- 标签云和标签筛选
- 拍照 / 上传书页
- 手指或鼠标框选 OCR 区域
- Google Vision OCR
- OpenAI AI 修正（默认关闭）
- OCR 物理换行合并
- 中文字符之间半角标点转全角，不影响英文句子
- 自动分句
- 保存、搜索、复制、删除书摘
- 标签和笔记
- Supabase 邮箱登录
- 云同步
- JSON 导出

## 配置

### Supabase

在 Supabase 创建项目后，进入 Project Settings → API，复制：

- Project URL
- publishable key / anon public key

修改 `app.js` 顶部：

```js
const SUPABASE_URL = "https://xxxx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_xxxx";
```

不要使用 secret key 或 service role key。

### Supabase 数据库

进入 SQL Editor，运行 `supabase_schema.sql` 全部内容。

成功提示 `Success. No rows returned` 是正常的。

### Supabase Auth

MVP 阶段建议关闭邮箱验证：

Authentication → Providers → Email → Confirm email: off

### Vercel 环境变量

Vercel → Project → Settings → Environment Variables 添加：

- GOOGLE_VISION_API_KEY
- OPENAI_API_KEY

如果暂时没有 OpenAI billing，可以不勾选页面里的“AI 修正 OCR”。默认已经关闭。

## 部署

上传全部文件到 GitHub，Vercel 会自动部署。

必须包含：

- index.html
- styles.css
- app.js
- api/ocr.js
- api/clean.js
- supabase_schema.sql
- README.md
- package.json
- vercel.json
