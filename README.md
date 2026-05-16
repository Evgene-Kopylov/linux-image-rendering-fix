# Image Renderer

Плагин для Obsidian, исправляющий проблемы отображения изображений на Linux (Ubuntu).

## Проблема

На Ubuntu в сборке Electron/Chromium отсутствуют кодеки изображений.
Obsidian загружает картинки через протокол `app://`, который возвращает статус 0 —
изображения не отображаются, особенно в директориях с emoji в названии.

## Как работает

Плагин перехватывает рендеринг markdown (MarkdownPostProcessor), находит все `<img>`,
читает файл изображения напрямую с диска через `vault.adapter.readBinary()`
и подменяет `src` на Blob URL (`blob:...`). Это обходит проблемный `app://` протокол.

## Возможности

- Чтение изображений в обход `app://` протокола
- Поддержка png, jpg, gif, webp, svg, bmp
- Автоматическая обработка при открытии страницы
- Команда **Reprocess images** для ручного обновления

## Установка

### Символическая ссылка (рекомендуется для разработки)

```bash
ln -s /путь/к/репозиторию /путь/к/хранилищу/.obsidian/plugins/image-renderer
```

После `npm run build` Obsidian подхватит новый `main.js` после перезагрузки плагина.

### Копирование файлов

Скопировать `main.js`, `manifest.json`, `styles.css` в директорию плагина:

```text
<Vault>/.obsidian/plugins/image-renderer/
```

## Разработка

```bash
npm install
npm run dev    # сборка с отслеживанием изменений
npm run build  # production-сборка
npm run lint   # ESLint
npm run test   # Vitest
```

## Лицензия

LGPL-3.0
