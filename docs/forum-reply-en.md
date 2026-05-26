Hi everyone,

Hi everyone,
I've been following this thread and the upstream Electron bug for a some time. Since it bosers me and none rushing to fix it, I built a plugin that works around it: "Linux Image Rendering Fix".

## How it bypasses the bug

The plugin intercepts Markdown rendering via `MarkdownPostProcessor`, finds every `<img>` element, reads the image file directly from disk using `vault.adapter.readBinary()`, and replaces `src` with a Blob URL (`blob:...`). This completely bypasses the broken `app://` protocol — no locale fiddling, no package switching, no renaming.

## Features

- **Automatic** — images are replaced on page open, tab switch, and file modification
- **Formats:** PNG, JPEG, GIF, WebP, SVG, BMP, ICO

- **Zero network requests** — works only inside the vault
- **Zero configuration** — install and forget

## Coverage

I've tested every scenario mentioned in this thread and beyond:

- Images embedded in a note — works
- Hover preview (popover) — works
- Viewing an image file directly — works
- Images on inactive/background tabs — works (MutationObserver catches them)

There may be edge cases I haven't found, but so far I haven't seen a broken image the plugin didn't catch.

## Known quirks

Some scenarios have a slight delay on first load — the system needs a "warm-up" moment before the plugin kicks in.

## Install

Community Plugins → Browse → search **Linux Image Rendering Fix** → Install → Enable

**Repository:** [GitHub](https://github.com/Evgene-Kopylov/linux-image-rendering-fix)

Tested on Ubuntu 24.04 (DEB). Should work on any distro and package format — the root cause is the same upstream Electron bug.

## Compared to workarounds in this thread

- No need to rename folders to ASCII
- No need to set `LANG`/`LC_ALL`
- No need to switch from Snap to DEB/Flatpak/AppImage
- No need to launch from terminal

One plugin, problem gone. Feedback and bug reports welcome on GitHub.
