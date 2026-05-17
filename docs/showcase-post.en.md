> ## Disclaimer
> Is this project **open source**? Yes
> Is this project completely **free**? Yes
> Is this project **vibe-coded** beyond the author's ability to comprehend how it works? No

# Linux Image Rendering Fix — solves broken images on Linux

**Repository:** [GitHub](https://github.com/Evgene-Kopylov/linux-image-rendering-fix)

**Install:** Community Plugins → Browse → **Linux Image Rendering Fix**

---

## The Problem

Linux users (Ubuntu, Pop!_OS, Linux Mint, Fedora, and others) have been struggling with Obsidian not displaying local images for **three years** (since v1.0.0). Instead of the image — a broken icon or blank space. Still unfixed at the application level.

**Root causes:**

1. **Broken `app://` protocol** — Electron/Chromium on Linux cannot resolve paths containing non-ASCII characters: emoji, diacritics, Cyrillic, CJK, and more.
2. **Missing image codecs** — some Linux Electron builds (especially Snap and Flatpak) lack codecs for PNG, JPEG, WebP, resulting in status 0 or decode failures.

Affected packages: **Snap**, **Flatpak**, **DEB**. AppImage is slightly more stable but not immune. ARM systems are also affected.

This is an upstream Electron/Chromium bug. The Obsidian team cannot fix it directly.

## The Solution

The plugin intercepts Markdown rendering via `MarkdownPostProcessor`, finds every `<img>` element, reads the image file directly from disk using `vault.adapter.readBinary()`, and replaces `src` with a Blob URL (`blob:...`). This completely bypasses the broken `app://` protocol.

**Tested on:** Ubuntu 24.04 (DEB package).

Other distributions (Pop!_OS, Linux Mint, Fedora, etc.) and package formats (Snap, Flatpak, AppImage) are likely affected — the root cause is an upstream Electron/Chromium bug, not distro-specific.

## Features

- **Automatic processing** — images are replaced on page open, tab switch, and file modification
- **Broad format support:** PNG, JPEG, GIF, WebP, SVG, BMP, ICO
- **Reprocess Images** command — manual refresh for the current view
- **Safe by design:** works only with files inside the vault, makes zero network requests
- **Zero configuration:** install and forget

## Limitations

- **Desktop only (Linux).** `isDesktopOnly: true`

## License

LGPL-3.0 — free and open source software.
