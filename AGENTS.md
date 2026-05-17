# Agents.md — правила для Linux Image Rendering Fix Plugin

## Язык и локализация

Разработка — на русском:

- коммиты (только заголовок)
- документация, комментарии, логи

## Процесс работы с задачами

Задачи — `docs/tasks/`, по файлу на задачу. Перед изменениями читать `docs/tasks/index.md`.

Порядок:

1. Взять свободную из `index.md`: `[ ]` → `[>]`
2. Выполнить (код, тесты)
3. Коммит → уведомить пользователя
4. Дождаться принятия коммита
5. Отметить `[x]`
6. Взять следующую
7. Если свободных нет — обновить `index.md` из `docs/tasks/`

## 🚫 Запрещённые файлы (никогда не читать)

- `node_modules/` — npm зависимости, большой объём
- `main.js` — сгенерированный бандл (очень большой, длинные строки)
- любые другие сгенерированные файлы

## Общие правила

- Неиспользуемые методы удалять без сожаления.
- Избегать равноправных вариантов → один способ делать что-либо.
- Без миграций данных.
- до версии 1.0.0 обратная совместимость означает отображать ошибку с причиной и вариантом решения, если что-то перестало работать.
- **Запрет хардкода цветов.** Никаких `#e53935`, `#999` в TS или CSS. Цвета — только через CSS-переменные (`var(--text-faint)`, `var(--background-modifier-border)`) или настройки плагина.
- **Переиспользование существующего.** Прежде чем создать константу/функцию — проверить, нет ли уже нужного в существующих модулях.

## File editing rules (Zed + DeepSeek)

CRITICAL: When using `edit_file` tool:

- NEVER rewrite entire file. Do targeted SEARCH and REPLACE only.
- `old_text` must include 3-5 lines of surrounding code to ensure uniqueness.
- `new_text` identical to `old_text` except the exact change.
- No markdown code blocks, no extra text inside `new_text`.
- Multiple unrelated changes → separate `edit_file` calls.
- **`edits` передавать как JSON-строку, не как массив.** Иначе VecOrJsonString. Формат: `"edits": "[{\"old_text\": \"...\", \"new_text\": \"...\"}]"`

Example:

Task: change `const port = 3000;` to `const port = 8080;`

✅ Correct `old_text`:

```javascript
const express = require('express');
const app = express();
const port = 3000;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
```

✅ Correct `new_text`:

```javascript
const express = require('express');
const app = express();
const port = 8080;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
```

❌ Wrong: replacing whole file content.

Если edit_file или любая файловая операция завершается с ошибкой доступа, блокировки или похожей:

1. Сохранить файл и повторить
2. Не вышло — жди и пробуй (2с → 4с → 8с). После каждой попытки: «Файл выглядит заблокированным, повторяю через N секунд…»
3. Не вышло — выведи:

```text
ОШИБКА: Не удаётся получить доступ к <файл> после нескольких попыток.
Вероятно он заблокирован другим процессом.
Я прекращаю работу и жду разрешения ситуации.
```

### Несохранённые изменения в файлах

Unsaved changes → `save_file` → продолжай. Без спроса.

## 🔥 Строгое отношение к неиспользуемому коду

- Запрещён код «для обратной совместимости».
- Запрещён код «на всякий случай».
- Запрещены закомментированные неиспользуемые блоки.
- Запрещены неиспользуемые переменные, функции, импорты, экспорты, методы класса.
- Любой невыполняемый код удалить.
- Перед коммитом проверять мёртвый код (ESLint `no-unused-vars`, TS `noUnusedLocals`/`noUnusedParameters`).
- Временно не нужная функциональность → удалить (не комментировать). Восстановить из git.

## Запуск shell-команд

- Оболочка `/bin/sh` (не bash).
- **Heredoc запрещён.** Не использовать `<< 'PYEOF'` и подобное.
- **Не использовать подстановки** (`$VAR`, `${VAR}`, `$(...)`, backticks, `<(...)`, `>(...)`).
- Для Python использовать **однострочный вызов**: `python3 -c '...'` (одинарные кавычки, без переносов).
- Для длинного Python-кода сначала записать скрипт в файл, затем вызвать `python3 script.py`.
- Избегать символа `!` в командах.

## Project overview

- Target: Obsidian Community Plugin (TS → bundled JS).
- Entry: `main.ts` → `main.js`, loaded by Obsidian.
- Release artifacts: `main.js`, `manifest.json`, `styles.css`.
- **Important:** DO NOT read `main.js`. Auto-generated, too big, long lines. Wastes context. Ignore.

## Environment & tooling

- Node.js: current LTS (18+ recommended).
- **Package manager: npm** (required — `package.json` defines scripts/deps).
- **Bundler: esbuild** (required — `esbuild.config.mjs` depends on it).
- Types: `obsidian` definitions.

### Install

```bash
npm install
```

### Dev (watch)

```bash
npm run dev
```

### Production build

```bash
npm run build
```

## Linting

- ESLint: `npm run lint`
- Stylelint: `npm run lint:css`
- TypeScript проверка: `tsc -noEmit -skipLibCheck` (встроено в `npm run build`)

## File & folder conventions

- **Organize into multiple files**: Split functionality, not everything in `main.ts`.
- Source in `src/`. `main.ts` small → plugin lifecycle (load, unload, register commands).
- **Example structure**:

  ```text
  src/
    main.ts           # Plugin entry point, lifecycle management
    settings.ts       # Settings interface and defaults
    commands/         # Command implementations
    ui/              # UI components, modals, views
    utils/           # Utility functions, helpers
    types.ts         # TypeScript interfaces and types
  ```

- **Never commit build artifacts**: `node_modules/`, `main.js`, generated files.
- Keep plugin small. Avoid large deps. Prefer browser-compatible packages.
- Generated output → plugin root. Release artifacts at top level (`main.js`, `manifest.json`, `styles.css`).

## Manifest rules (`manifest.json`)

- Must include (non-exhaustive):
  - `id` (plugin ID, matches folder name for local dev)
  - `name`, `version` (SemVer `x.y.z`), `minAppVersion`, `description`, `isDesktopOnly` (bool)
  - Optional: `author`, `authorUrl`, `fundingUrl` (string or map)
- Never change `id` after release. Stable API.
- Keep `minAppVersion` accurate for newer APIs.
- Canonical validation: <https://github.com/obsidianmd/obsidian-releases/blob/master/.github/workflows/validate-plugin-entry.yml>

## Testing

- Manual test: copy `main.js`, `manifest.json`, `styles.css` to:

  ```text
  <Vault>/.obsidian/plugins/<plugin-id>/
  ```

- Reload Obsidian, enable plugin in **Settings → Community plugins**.

### Unit testing

- Использовать Vitest (конфиг `vitest.config.ts`).
- **Запрещены моки** внешних зависимостей (Obsidian API, файловая система). Вместо моков — тестировать изолированные чистые функции (утилиты, парсеры, преобразования).
- Тесты в `tests/`.

## Commands & settings

- User-facing commands via `this.addCommand(...)`.
- Config → settings tab + sensible defaults.
- Persist settings: `this.loadData()` / `this.saveData()`.
- Use stable command IDs; avoid renaming after release.

## Versioning & releases

- Bump `version` in `manifest.json` (SemVer). Update `versions.json` (plugin version → min app version).
- GitHub release: tag exactly matches `manifest.json` version (no leading `v`).
- Attach `manifest.json`, `main.js`, `styles.css` (if present) as individual assets.
- After initial release, follow community catalog process.

## Security, privacy, compliance

Follow Obsidian's **Developer Policies** + **Plugin Guidelines**:

- Default local/offline. Network only if essential.
- No hidden telemetry. Analytics/third-party → explicit opt-in, documented.
- No remote code, fetch/eval, or auto-update outside releases.
- Read/write only inside vault. No outside access.
- Disclose external services, data sent, risks.
- No vault contents, filenames, personal info without necessity + consent.
- No deceptive patterns, ads, spam.
- Use `register*` helpers for cleanup → safe unload.

## UX & copy guidelines

- Sentence case for headings, buttons, titles.
- Clear action-oriented imperatives.
- **Bold** for literal UI labels. Prefer "select".
- Arrow notation for navigation: **Settings → Community plugins**.
- Short, consistent strings, jargon-free.

## Performance

- Light startup. Lazy init.
- Batch disk access, avoid excessive vault scans.
- Debounce/throttle expensive ops on file system events.

## Coding conventions

- TypeScript with `"strict": true` preferred.
- **Keep `main.ts` minimal**: lifecycle only. Delegate to separate modules.
- **Split large files**: >200-300 lines → smaller focused modules.
- **Single responsibility** per file.
- Bundle everything into `main.js` (no unbundled runtime deps).
- Avoid Node/Electron APIs for mobile compat; set `isDesktopOnly` accordingly.
- Prefer `async/await` over promise chains; handle errors gracefully.

## Mobile

- Плагин `isDesktopOnly: true` — только десктоп (Linux).

## Agent do/don't

### Do

- Add commands with stable IDs (don't rename after release).
- Provide defaults + validation in settings.
- Idempotent code paths → reload/unload doesn't leak listeners/intervals.
- Use `this.register*` helpers for everything needing cleanup.

### Don't

- Introduce network calls without an obvious user-facing reason and documentation.
- Ship features that require cloud services without clear disclosure and explicit opt-in.
- Store or transmit vault contents unless essential and consented.

## Troubleshooting

- Plugin doesn't load after build: ensure `main.js` and `manifest.json` are at the top level of the plugin folder under `<Vault>/.obsidian/plugins/<plugin-id>/`.
- Build issues: if `main.js` is missing, run `npm run build` or `npm run dev` to compile your TypeScript source code.
- Commands not appearing: verify `addCommand` runs after `onload` and IDs are unique.
- Settings not persisting: ensure `loadData`/`saveData` are awaited and you re-render the UI after changes.

## References

- Obsidian sample plugin: https://github.com/obsidianmd/obsidian-sample-plugin
- API documentation: https://docs.obsidian.md
- Developer policies: https://docs.obsidian.md/Developer+policies
- Plugin guidelines: https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines
- Style guide: https://help.obsidian.md/style-guide
