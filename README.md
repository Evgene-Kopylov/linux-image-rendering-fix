# Image Renderer

Obsidian plugin that fixes image rendering issues on Linux (Ubuntu).

## Problem

On Ubuntu, the Electron/Chromium build lacks image codecs.
Obsidian loads images via the `app://` protocol, which returns status 0 —
images don't display, especially in directories with emoji in their names.

## How it works

The plugin intercepts markdown rendering (MarkdownPostProcessor), finds all `<img>`
elements, reads the image file directly from disk via `vault.adapter.readBinary()`
and replaces `src` with a Blob URL (`blob:...`). This bypasses the broken `app://` protocol.

## Features

- Loads images bypassing the `app://` protocol
- Supports png, jpg, gif, webp, svg, bmp
- Automatic processing when opening a page
- **Reprocess images** command for manual refresh

## Installation

### Symlink (recommended for development)

```bash
ln -s /path/to/repo /path/to/vault/.obsidian/plugins/image-renderer
```

After `npm run build`, Obsidian picks up the new `main.js` on plugin reload.

### Copy files

Copy `main.js`, `manifest.json`, `styles.css` to the plugin directory:

```text
<Vault>/.obsidian/plugins/image-renderer/
```

## Development

```bash
npm install
npm run dev    # watch mode
npm run build  # production build
npm run lint   # ESLint
npm run test   # Vitest
```

## License

LGPL-3.0
