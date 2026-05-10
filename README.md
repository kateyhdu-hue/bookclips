# BookClips 摘书 - 账号 + 云同步版

支持 Supabase 邮箱注册/登录、书籍和书摘云端同步、Google Vision OCR、OpenAI 自动修正、框选识别、自动分句、标签和笔记。

## 1. 创建 Supabase 项目

在 Supabase 新建 project。

Project Settings → API 里复制：

```text
Project URL
anon public key
```

## 2. 修改 app.js

把顶部这两行：

```js
const SUPABASE_URL = "__SUPABASE_URL__";
const SUPABASE_ANON_KEY = "__SUPABASE_ANON_KEY__";
```

替换成你的 Supabase 值。

## 3. 创建数据库表

Supabase → SQL Editor → New query。

复制 `supabase_schema.sql` 全部内容并 Run。

## 4. 设置登录

Supabase → Authentication → Providers，确保 Email 已开启。

如不想注册后查邮件确认，可在 Authentication 设置里关闭 email confirmation。

## 5. Vercel 环境变量

继续保留：

```text
GOOGLE_VISION_API_KEY
OPENAI_API_KEY
```

## 6. 部署

上传 GitHub，确认包含：

```text
api/ocr.js
api/clean.js
supabase_schema.sql
```

Vercel 会自动重新部署。

## 7. 使用

电脑注册/登录后保存书摘；手机打开同一网址，用同一邮箱登录，即可看到云端同步的书籍和摘录。

旧版 localStorage 数据不会自动迁移；可以先导出 JSON，后续再加“导入 JSON”。
