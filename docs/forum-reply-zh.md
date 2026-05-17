大家好，

我开发了一个 Obsidian 插件专门解决这个问题：**Linux Image Rendering Fix**。

## 问题根源

正如帖子中提到的，这是 Electron/Chromium 的 upstream bug。`app://` 协议无法解析包含非 ASCII 字符（中文、俄文、表情符号等）的路径。加上某些 Linux 的 Electron 构建（尤其是 Snap 和 Flatpak）缺少图片编解码器（PNG、JPEG、WebP）。这个问题从 Obsidian v1.0.0 开始已经存在了三年，至今未在应用层面修复。

## 我的插件如何修复

插件通过 `MarkdownPostProcessor` 拦截 Markdown 渲染，找到每个 `<img>` 元素，使用 `vault.adapter.readBinary()` 直接从磁盘读取图片文件的二进制数据，然后用 Blob URL（`blob:...`）替换原来的 `src`。这样就**完全绕过了有问题的 `app://` 协议**，也不依赖 Electron 的编解码器。

## 特点

- **自动处理** — 打开页面、切换标签页、修改文件时自动替换图片
- **支持格式：** PNG、JPEG、GIF、WebP、SVG、BMP、ICO
- **Reprocess Images** 命令 — 手动刷新当前视图
- **安全设计** — 只在 vault 内工作，零网络请求
- **零配置** — 安装即用

## 覆盖范围

我测试了本帖子中提到的以及更多的所有场景：

- 笔记中嵌入的图片 — 正常
- 悬停预览（弹出窗口） — 正常
- 直接查看图片文件 — 正常
- 非活跃/后台标签页中的图片 — 正常（MutationObserver 捕获）

可能还有我没发现的边缘情况，但到目前为止，我还没见过插件没捕获到的损坏图片。

## 已知小问题

某些场景在首次加载时有轻微延迟 — 系统需要一点“预热”时间，插件才能开始工作。

## 安装

Settings → Community Plugins → Browse → 搜索 **Linux Image Rendering Fix** → Install → Enable

**仓库：** [GitHub](https://github.com/Evgene-Kopylov/linux-image-rendering-fix) | [GitLab](https://gitlab.com/Evgene-Kopylov/linux-image-rendering-fix)

**许可证：** LGPL-3.0，完全免费开源。

已在 Ubuntu 24.04（DEB 包）上测试通过。其他发行版（Pop!_OS、Linux Mint、Fedora、Arch 等）和包格式（Snap、Flatpak、AppImage）同样适用 — 因为根因是 Electron 的上游 bug，与具体发行版无关。

## 相比其他 workaround 的优势

- **不需要**把文件夹改成英文名
- **不需要**设置 `LANG`/`LC_ALL` 环境变量
- **不需要**切换安装方式（Snap → DEB）
- **一个插件，全部解决**

欢迎试用和反馈！有问题可以在 GitHub/GitLab 提 issue。:pray:
