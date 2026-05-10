# BookClips 摘书

BookClips 是一个实体书摘录 Web App 原型。

你可以用它：

- 新增不同书籍
- 上传或拍照实体书页面
- OCR 识别中文和英文
- 自动分句
- 保存喜欢的句子
- 按书籍、页码、标签、笔记管理摘录
- 搜索书摘
- 导出 JSON 备份

## 在线部署到 Vercel

### 方法：GitHub + Vercel

1. 在 GitHub 新建一个 repository，例如 `bookclips`
2. 把本项目所有文件上传到 repository
3. 打开 Vercel
4. 点击 **Add New Project**
5. 选择你的 GitHub repository
6. Framework Preset 选择 **Other**
7. Build Command 留空
8. Output Directory 留空或填 `.`
9. 点击 **Deploy**

部署成功后，你会得到一个网址，例如：

```text
https://bookclips.vercel.app
```

用 iPhone Safari 打开后，可以点击分享按钮，然后选择 **添加到主屏幕**。

## 本地运行

直接双击打开 `index.html` 即可。

或者在项目文件夹中运行：

```bash
python3 -m http.server 3000
```

然后浏览器打开：

```text
http://localhost:3000
```

## 注意事项

- OCR 使用 Tesseract.js，需要联网加载 OCR 库。
- 当前版本的数据保存在浏览器 localStorage 中。
- 如果换设备、换浏览器或清除缓存，数据可能丢失。
- 请定期使用“导出 JSON”备份。
- 正式产品版本应加入用户登录、云同步、数据库、图片存储和更强 OCR 服务。
