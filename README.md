# BookClips Full Release v1.1

完整版功能：

- Supabase 邮箱注册 / 登录
- 书籍和书摘云同步
- 手机、电脑同账号同步
- Google Vision OCR
- OpenAI AI 修正 OCR（默认关闭）
- 拍照 / 上传图片
- 手指或鼠标框选识别区域
- OCR 物理换行合并
- 中文字符之间半角标点自动转全角，避免影响英文句子
- 自动分句
- 保存、搜索、复制、删除书摘
- 标签和笔记
- JSON 导出
- Vercel serverless API
- 完整 Supabase RLS schema

---

## 1. 上传 GitHub

把本项目所有文件上传到 GitHub repository。

必须包含：

```text
index.html
styles.css
app.js
api/ocr.js
api/clean.js
supabase_schema.sql
package.json
vercel.json
README.md
```

---

## 2. Supabase 设置

### 创建项目

在 Supabase 新建 project。

### 获取 URL 和 publishable key

Project Settings → API

复制：

```text
Project URL
publishable key / anon public key
```

### 修改 app.js

打开 `app.js` 顶部：

```js
const SUPABASE_URL = "REPLACE_WITH_YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "REPLACE_WITH_YOUR_SUPABASE_PUBLISHABLE_KEY";
```

替换为：

```js
const SUPABASE_URL = "https://xxxx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_xxxx";
```

不要使用 secret key 或 service role key。

---

## 3. 创建数据库表

Supabase → SQL Editor

运行 `supabase_schema.sql` 全部内容。

这会创建：

- books
- clips
- Row Level Security policies

每个用户只能看到自己的书和摘录。

---

## 4. 关闭邮箱确认（MVP 推荐）

Supabase → Authentication → Providers → Email

关闭：

```text
Confirm email / Enable email confirmations
```

否则注册后需要查收验证邮件。

---

## 5. Vercel 环境变量

Vercel → Project → Settings → Environment Variables

添加：

```text
GOOGLE_VISION_API_KEY
OPENAI_API_KEY
```

如果暂时没有 OpenAI billing，可以不勾选 App 里的“AI 自动修正”。默认是关闭的。

可选：

```text
OPENAI_MODEL = gpt-4.1-mini
```

---

## 6. 部署

GitHub commit 后，Vercel 会自动部署。

如果改了环境变量，手动 Redeploy 一次。

---

## 7. 快速测试

打开网站后：

1. 注册或登录
2. 新增一本书
3. 上传图片
4. 框选文字区域
5. 点击识别框选区域
6. 自动分句
7. 保存句子
8. 用手机同账号登录，应能看到同一批书摘

---

## 8. 常见问题

### 显示 Supabase 未配置

检查 `app.js` 顶部是否替换了 Supabase URL 和 key。

### 注册一直卡住

此版本有 15 秒 timeout，会显示具体错误。也请检查：

- Supabase URL 是否正确
- publishable key 是否正确
- Email confirmation 是否关闭
- Supabase 项目是否暂停
- 浏览器网络是否能访问 Supabase

### OCR 失败

检查 Vercel 环境变量：

```text
GOOGLE_VISION_API_KEY
```

以及 Google Cloud 是否启用 Cloud Vision API。

### AI 修正失败

检查：

```text
OPENAI_API_KEY
```

以及 OpenAI API billing。ChatGPT Plus 不等于 OpenAI API 额度。

---

## 9. 安全说明

Supabase publishable / anon key 可以放前端。安全依赖 RLS policy。

不要把以下 key 放入前端：

```text
service_role
secret key
```
