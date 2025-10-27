# 快速开始指南 🚀

## 一、安装依赖 ✅ (已完成)

```bash
npm install
```

## 二、生成图标 🎨

### 方法1：使用在线图标生成器（最快）

1. 打开浏览器，访问 `scripts/generate-icons.html` 文件：
   ```
   双击打开或在浏览器中输入文件路径
   ```

2. 你会看到三个图标预览和下载按钮

3. 点击每个下载按钮，保存：
   - icon16.png
   - icon48.png  
   - icon128.png

4. 将这三个文件移动到 `public/icons/` 文件夹

### 方法2：使用任意图标（PNG格式）

如果你有自己的图标设计：

1. 准备三个PNG文件（尺寸分别为 16x16、48x48、128x128）
2. 重命名为 `icon16.png`、`icon48.png`、`icon128.png`
3. 放到 `public/icons/` 文件夹

### 方法3：临时跳过（仅用于快速测试）

如果只是想快速测试功能，可以：
1. 找任意三张PNG图片
2. 放到 `public/icons/`
3. 重命名为对应的文件名即可（不严格要求尺寸）

## 三、重新构建 🔨

有了图标后，重新构建项目：

```bash
npm run build
```

你应该看到类似这样的成功信息：
```
✓ built in XX.XXs
✓ Copied manifest.json
✓ Copied popup.html
✓ Copied icon16.png
✓ Copied icon48.png
✓ Copied icon128.png
```

## 四、加载到Chrome 🌐

1. 打开 Chrome 浏览器

2. 在地址栏输入：
   ```
   chrome://extensions/
   ```

3. 打开右上角的 **"开发者模式"** 开关

4. 点击 **"加载已解压的扩展程序"**

5. 选择你的项目中的 **`dist`** 文件夹

6. 看到 "Prompt Stock" 出现在列表中，表示安装成功！

## 五、测试使用 🎯

1. 访问默认启用的网站：
   ```
   https://chat.deepseek.com
   ```

2. 你应该在页面右侧看到一个 **紫色渐变的悬浮球** 💜

3. **测试交互**：
   - 点击悬浮球 → 侧边栏滑出
   - 按 `Ctrl+M` → 切换侧边栏
   - 点击 "Add New Prompt" → 添加你的第一个prompt
   - 测试搜索、编辑、删除、复制功能

4. **配置其他域名**：
   - 点击右上角齿轮图标 ⚙️
   - 添加新域名，例如：`https://chatgpt.com`
   - 保存设置
   - 访问新域名，悬浮球会出现

## 常见问题 ❓

### Q: 悬浮球没有显示？

检查：
- ✅ 是否在已启用的域名（默认：chat.deepseek.com）
- ✅ 刷新页面试试
- ✅ 打开开发者工具（F12）查看是否有错误

### Q: 我想在所有网站都显示？

1. 打开侧边栏
2. 点击设置图标
3. 添加域名时输入：`http://`、`https://` 等你常用网站的完整URL
4. 或修改 `manifest.json` 中的 content_scripts

### Q: 如何修改默认域名？

在侧边栏的设置中可以：
- 删除 `https://chat.deepseek.com`
- 添加你想要的域名

## 开发模式 👨‍💻

如果你要修改代码：

```bash
npm run dev
```

这会监视文件变化并自动重新构建。修改后，去Chrome扩展页面点击刷新按钮即可。

## 下一步 📚

- 查看 `SETUP.md` 了解详细的项目结构
- 查看 `README.md` 了解所有功能
- 开始添加你的常用prompts！

---

🎉 **恭喜！你的 Prompt Stock 插件已经可以使用了！**

