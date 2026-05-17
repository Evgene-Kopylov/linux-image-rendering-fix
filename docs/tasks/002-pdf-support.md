# Поддержка PDF

## Контекст

Плагин обрабатывает только `<img>`. PDF в Obsidian рендерится через PDF.js, который делает `fetch`/`XHR` с `app://` — баг с не-ASCII путями воспроизводится. Пользователи форума подтверждают: PDF с умляутами/кириллицей/CJK — пустые (0 страниц).

## Что сделано

1. `pdf` добавлен в MIME_TYPES и SUPPORTED_EXTENSIONS
2. `IMAGE_EXTENSIONS` → `SUPPORTED_EXTENSIONS`
3. `processImage` → `processSrcElement` (обобщён для img/iframe/embed/object)
4. `createImageProcessor` ищет iframe/embed/object
5. FileView в main.ts обрабатывает PDF (через SUPPORTED_EXTENSIONS)
6. Тест MIME pdf

## Что пробовали для прямого просмотра PDF (FileView)

| Подход | Результат | Причина |
|---|---|---|
| Перехват `window.fetch` | ❌ | PDF.js в отдельном iframe — свой контекст, fetch главного окна не затрагивается |
| Перехват `XMLHttpRequest` | ❌ | То же: iframe имеет собственный XHR |
| Поиск `<iframe src="app://...">` в DOM | ❌ | Obsidian создаёт iframe без src, URL передаётся в PDF.js программно (postMessage или глобальная переменная) |
| MutationObserver + processSrcElement | ❌ | PDF.js рендерит на `<canvas>`, не через iframe/embed/object |
| Веб-вьювер (core plugin) | ❌ | Создаёт `<div>`, не iframe/embed. Контент идёт через canvas |

## Расследование (2026-05-17)

1. **Лог ошибки:** `app://77be.../CV Rust - Копылов Евгений.pdf` → `Unexpected server response (0)`. Статус 0 = протокол не может разрешить путь с кириллицей.

2. **DOM-структура PDF-вьюхи (containerEl.innerHTML):** только `<div class="view-header">` с кнопками навигации. Контентная область создаётся асинхронно и рендерится на canvas.

3. **MutationObserver:** при открытии PDF ловит только `<DIV>`, ни одного `<IFRAME>`, `<EMBED>`, `<OBJECT>`.

4. **processCurrentView отрабатывает:** `type=pdf file=CV Rust - Копылов Евгений.pdf ext=pdf` — плагин видит PDF, вызывает processor, но в containerEl нет элементов для перехвата.

## Вывод

PDF.js в Obsidian:
- Работает в изолированном iframe (fetch/XHR недоступны из главного окна)
- Рендерит на `<canvas>`, не через `<iframe src="...">`
- URL PDF передаётся программно (postMessage/глобальная переменная), не через DOM-атрибут

Прямой просмотр PDF (FileView) **архитектурно недоступен** для перехвата на уровне плагина Obsidian. Единственный путь — патч Obsidian/Electron на уровне C++ (протокол `app://`), что выходит за рамки плагина.

## Статус

[ ] Закрыто. Прямой просмотр PDF невозможен. Остаётся только встроенный `![[file.pdf]]` — если найдём способ перехвата.
