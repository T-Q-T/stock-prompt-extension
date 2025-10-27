# Prompt Stock - Browser Extension

A modern and beautiful browser extension for managing your AI prompts efficiently.

## Features

✨ **Key Features:**
- 🎯 **Floating Button**: Elegant floating button that appears on configured domains
- 📝 **Prompt Management**: Add, edit, delete, and copy prompts with ease
- 🔍 **Search**: Quickly find prompts with instant search
- ⚙️ **Domain Settings**: Configure which websites show the extension
- ⌨️ **Keyboard Shortcut**: Toggle sidebar with `Ctrl+M`
- 💾 **Local Storage**: All data stored locally in your browser
- 🎨 **Modern UI**: Beautiful gradient design with smooth animations

## Installation

### Development

1. Install dependencies:
```bash
npm install
```

2. Build the extension:
```bash
npm run build
```

3. Load in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### Development Mode (with auto-reload)

```bash
npm run dev
```

Then load the `dist` folder in Chrome as described above.

## Usage

1. **Enable on Domains**: By default, the extension works on `https://chat.deepseek.com`. You can configure additional domains in settings.

2. **Add Prompts**: Click the floating button or press `Ctrl+M`, then click "Add New Prompt" to create a new prompt.

3. **Manage Prompts**: 
   - Click the copy icon to copy a prompt to clipboard
   - Click the edit icon to modify a prompt
   - Click the delete icon to remove a prompt

4. **Search**: Use the search bar to filter prompts by title or content

5. **Settings**: Click the gear icon to configure enabled domains

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Storage**: Browser LocalStorage

## Project Structure

```
src/
├── components/          # React components
│   ├── FloatingButton.tsx
│   ├── Sidebar.tsx
│   ├── PromptItem.tsx
│   ├── AddPromptForm.tsx
│   └── Settings.tsx
├── content/            # Content script entry
│   ├── App.tsx
│   └── index.tsx
├── types/              # TypeScript types
│   └── index.ts
├── utils/              # Utility functions
│   ├── storage.ts
│   └── clipboard.ts
└── styles/             # CSS styles
    └── content.css
```

## License

MIT

