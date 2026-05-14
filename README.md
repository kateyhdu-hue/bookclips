# BookClips v2.1 App-style Release

这是原创手机书摘 App 风格版本，不是任何现有 App 的 1:1 复制。

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
- 修复登录成功后不自动跳转

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

### Supabase 数据库

进入 SQL Editor，运行 `supabase_schema.sql` 全部内容。

### Vercel 环境变量

添加：

- GOOGLE_VISION_API_KEY
- OPENAI_API_KEY

如果没有 OpenAI billing，可以不勾选页面里的“AI 修正 OCR”。默认已经关闭。
