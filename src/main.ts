import { FileView, MarkdownView, Plugin, TFile } from "obsidian";

declare const activeWindow: Window;
declare const activeDocument: Document;
import {
    createImageProcessor,
    IMAGE_EXTENSIONS,
} from "./utils/image-processor";

/** Задержка дебаунса для MutationObserver (мс) */
const OBSERVER_DEBOUNCE_MS = 100;

/**
 * Плагин Linux Image Loading Fix для Obsidian
 * Исправляет проблемы отображения изображений на Linux
 */
export default class ImageRendererPlugin extends Plugin {
    private observer: MutationObserver | null = null;

    onload(): void {
        // Регистрируем обработчик изображений
        this.registerMarkdownPostProcessor(
            createImageProcessor(this.app.vault),
        );

        // При старте дожидаемся готовности макета
        this.app.workspace.onLayoutReady(() => {
            this.processCurrentView();
        });

        // Обработка при смене активного файла
        this.registerEvent(
            this.app.workspace.on("active-leaf-change", (leaf) => {
                const view = leaf?.view;
                if (!view) return;

                if (view instanceof MarkdownView) {
                    createImageProcessor(this.app.vault)(view.contentEl);
                    return;
                }

                // Файл картинки открыт напрямую
                if (view instanceof FileView) {
                    const file = view.file;
                    if (
                        file instanceof TFile &&
                        IMAGE_EXTENSIONS.has(file.extension)
                    ) {
                        createImageProcessor(this.app.vault)(view.containerEl);
                    }
                }
            }),
        );

        // При изменении .md-файла форсим перерендер неактивных вкладок
        this.registerEvent(
            this.app.vault.on("modify", (file) => {
                if (!(file instanceof TFile)) return;
                if (file.extension !== "md") return;

                this.app.workspace.iterateAllLeaves((leaf) => {
                    const view = leaf.view;
                    if (
                        view instanceof MarkdownView &&
                        view.file?.path === file.path
                    ) {
                        view.previewMode.rerender();
                    }
                });
            }),
        );

        // Перехватываем все img в DOM: неактивные вкладки, превью при наведении
        let observerTimer: number | null = null;
        const processor = createImageProcessor(this.app.vault);

        this.observer = new MutationObserver((mutations) => {
            // Пропускаем мутации от собственной обработки
            if (!this.observer) return;

            // Собираем уникальные элементы
            const seen = new Set<HTMLElement>();
            for (const m of mutations) {
                m.addedNodes.forEach((node) => {
                    if (node.instanceOf(HTMLElement)) {
                        seen.add(node);
                    }
                });
            }

            if (seen.size === 0) return;

            // Отключаем observer на время обработки, чтобы не ловить свои изменения
            this.observer.disconnect();

            // Дебаунс: ждём пока поток изменений утихнет
            if (observerTimer) activeWindow.clearTimeout(observerTimer);
            observerTimer = activeWindow.setTimeout(() => {
                for (const el of seen) {
                    processor(el);
                }
                // Переподключаем observer
                this.observer?.observe(activeDocument.body, {
                    childList: true,
                    subtree: true,
                });
            }, OBSERVER_DEBOUNCE_MS);
        });

        this.observer.observe(activeDocument.body, {
            childList: true,
            subtree: true,
        });

        this.register(() => {
            this.observer?.disconnect();
        });
    }

    /** Принудительно запускает обработчик на всех открытых вьюхах */
    private processCurrentView(): void {
        const processor = createImageProcessor(this.app.vault);

        this.app.workspace.iterateAllLeaves((leaf) => {
            const view = leaf.view;
            if (!view) return;

            if (view instanceof MarkdownView) {
                processor(view.contentEl);
                return;
            }

            if (view instanceof FileView) {
                const file = view.file;
                if (
                    file instanceof TFile &&
                    IMAGE_EXTENSIONS.has(file.extension)
                ) {
                    processor(view.containerEl);
                }
            }
        });
    }
}
