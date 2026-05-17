import { FileView, MarkdownView, Plugin, TFile } from "obsidian";
import {
    createImageProcessor,
    IMAGE_EXTENSIONS,
} from "./utils/image-processor";

/**
 * Плагин Linux Image Rendering Fix для Obsidian
 * Исправляет проблемы отображения изображений на Linux
 */
export default class ImageRendererPlugin extends Plugin {
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

        // Команда для повторной обработки изображений
        this.addCommand({
            id: "reprocess-images",
            name: "Reprocess images",
            callback: () => {
                this.processCurrentView();
            },
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
