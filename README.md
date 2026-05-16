# Image Renderer

Плагин для Obsidian, исправляющий проблемы отображения изображений на Linux.

## Возможности

- Диагностика проблем рендеринга изображений
- Обработка неподдерживаемых форматов

## Установка

### Символическая ссылка (рекомендуется для разработки)

```bash
ln -s "$PWD" /home/death/Documents/TEST-VAULT-3/.obsidian/plugins
```

После `npm run build` Obsidian сам подхватит новый `main.js` после перезагрузки плагина.

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
