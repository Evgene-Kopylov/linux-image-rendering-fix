# Linux Image Rendering Fixer

Obsidian plugin that fixes image rendering issues on Linux (Ubuntu).

## Problem

On **Linux**, especially **Ubuntu** and derivatives (Pop!_OS, Linux Mint, etc.),
Obsidian (an Electron/Chromium app) often fails to display local images.
The issue has been reported since **2022** (v1.0.0) and remains unfixed.

The root cause is twofold:

1. **Broken `app://` protocol** — Electron/Chromium cannot resolve paths
   with non-ASCII characters: emoji, diacritics, Cyrillic, CJK, etc.
2. **Missing image codecs** — some Linux Electron builds lack codecs
   for PNG, JPEG, WebP, causing status 0 or decode failures.

Affects **Snap**, **Flatpak**, and **DEB** packages. **AppImage** is
slightly more stable but not immune. ARM systems also affected.

This is an upstream Electron/Chromium bug. The Obsidian team cannot
fix it directly. This plugin provides a reliable workaround.

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
ln -s "$PWD" /home/death/obsidian-vault/.obsidian/plugins/linux-image-rendering-fixer
```

After `npm run build`, Obsidian picks up the new `main.js` on plugin reload.

### Copy files

Copy `main.js`, `manifest.json`, `styles.css` to the plugin directory:

```text
<Vault>/.obsidian/plugins/linux-image-rendering-fixer/
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
