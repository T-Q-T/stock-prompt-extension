# 设置指南 / Setup Guide

## 快速开始 / Quick Start

### 1. 安装依赖 / Install Dependencies

```bash
npm install
```

### 2. 生成图标 / Generate Icons

插件需要三个图标文件。你可以用以下两种方式之一：

#### 方式A：使用图标生成器（推荐用于快速测试）

1. 在浏览器中打开 `scripts/generate-icons.html`
2. 点击每个下载按钮下载图标
3. 将下载的文件移动到 `public/icons/` 目录

#### 方式B：使用自己的图标

将你的图标文件放在 `public/icons/` 目录，命名为：
- `icon16.png` (16x16px)
- `icon48.png` (48x48px)
- `icon128.png` (128x128px)

### 3. 构建插件 / Build Extension

```bash
npm run build
```

这将编译并打包所有文件到 `dist/` 目录。

### 4. 在Chrome中加载 / Load in Chrome

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目的 `dist/` 文件夹

### 5. 测试插件 / Test Extension

1. 访问 `https://chat.deepseek.com`（默认启用域名）
2. 你应该能看到右侧的悬浮球
3. 点击悬浮球或按 `Ctrl+M` 打开侧边栏

## 开发模式 / Development Mode

在开发过程中，你可以使用监视模式：

```bash
npm run dev
```

这会在你修改代码时自动重新构建。修改后，需要在 Chrome 扩展页面点击刷新按钮来重新加载插件。

## 功能说明 / Features

### 🎯 悬浮球
- 默认显示在页面右侧中间
- 点击打开/关闭侧边栏
- 渐变色设计，悬停时有放大效果

### 📝 Prompt 管理
- **添加**：点击"Add New Prompt"按钮
- **编辑**：鼠标悬停在prompt卡片上，点击编辑图标
- **删除**：点击删除图标
- **复制**：点击复制图标，将prompt内容复制到剪贴板

### 🔍 搜索功能
- 支持按标题或内容搜索
- 实时过滤结果

### ⚙️ 设置
- **启用/禁用插件**：全局开关
- **域名管理**：
  - 查看已启用的域名列表
  - 添加新域名（必须包含协议，如 `https://example.com`）
  - 删除域名
  - 插件只在配置的域名上显示

### ⌨️ 快捷键
- `Ctrl+M`：切换侧边栏开关

## 项目结构 / Project Structure

```
stock-prompt-extension/
├── src/
│   ├── components/          # React 组件
│   │   ├── FloatingButton.tsx    # 悬浮球
│   │   ├── Sidebar.tsx           # 侧边栏容器
│   │   ├── PromptItem.tsx        # Prompt 卡片
│   │   ├── AddPromptForm.tsx     # 添加表单
│   │   └── Settings.tsx          # 设置页面
│   ├── content/            # Content Script
│   │   ├── App.tsx              # 主应用组件
│   │   └── index.tsx            # 入口文件
│   ├── types/              # TypeScript 类型定义
│   │   └── index.ts
│   ├── utils/              # 工具函数
│   │   ├── storage.ts           # localStorage 管理
│   │   └── clipboard.ts         # 剪贴板操作
│   └── styles/             # 样式文件
│       └── content.css          # 主样式文件
├── public/
│   └── icons/              # 图标文件
├── scripts/                # 辅助脚本
│   ├── generate-icons.html      # 图标生成器
│   ├── post-build.js            # 构建后处理
│   └── setup-icons.ps1          # 图标设置脚本
├── dist/                   # 构建输出目录
├── manifest.json           # 插件清单
├── package.json
├── vite.config.ts         # Vite 配置
├── tailwind.config.js     # Tailwind 配置
└── tsconfig.json          # TypeScript 配置
```

## 技术栈 / Tech Stack

- **框架**：React 18 + TypeScript
- **构建工具**：Vite
- **样式**：Tailwind CSS
- **图标**：Lucide React
- **存储**：Browser LocalStorage

## 常见问题 / FAQ

### Q: 插件没有显示悬浮球？
A: 检查以下几点：
1. 是否在已启用的域名上（默认为 chat.deepseek.com）
2. 在设置中检查插件是否全局启用
3. 刷新页面或重新加载插件

### Q: 如何添加更多域名？
A: 
1. 点击悬浮球打开侧边栏
2. 点击右上角的设置图标
3. 在"Enabled Domains"部分输入新域名（包含协议）
4. 点击"+"按钮添加
5. 点击"Save Settings"保存

### Q: 数据存储在哪里？
A: 所有数据都存储在浏览器的 localStorage 中，只在本地保存，不会上传到云端。

### Q: 快捷键不工作？
A: 确保：
1. 焦点在网页上（不在浏览器地址栏或开发者工具）
2. 没有其他扩展占用了 Ctrl+M 快捷键
3. 在已启用的域名上

### Q: 如何自定义样式？
A: 
1. 修改 `src/styles/content.css` 中的样式
2. 修改 `tailwind.config.js` 中的主题配置
3. 重新构建：`npm run build`

## 发布准备 / Production Checklist

在发布到 Chrome Web Store 之前：

- [ ] 替换占位符图标为专业设计的图标
- [ ] 更新 `manifest.json` 中的描述和版本号
- [ ] 添加更多屏幕截图用于商店页面
- [ ] 测试在不同网站上的兼容性
- [ ] 测试所有功能是否正常工作
- [ ] 检查控制台是否有错误
- [ ] 优化性能和包大小

## 支持 / Support

如有问题或建议，请提交 Issue。

---

Made with ❤️ using React + TypeScript + Vite

