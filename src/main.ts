import { MarkdownView, Plugin } from "obsidian";
import { createImageProcessor } from "./utils/image-processor";

/**
 * Плагин Linux Image Rendering Fixer для Obsidian
 * Исправляет проблемы отображения изображений на Linux
 */
export default class ImageRendererPlugin extends Plugin {
    async onload(): Promise<void> {
        // Регистрируем обработчик изображений
        this.registerMarkdownPostProcessor(
            createImageProcessor(this.app.vault),
        );

        // Принудительно обрабатываем текущую открытую страницу
        this.processCurrentView();

        // Команда для повторной обработки изображений
        this.addCommand({
            id: "reprocess-images",
            name: "Reprocess images",
            callback: () => {
                this.processCurrentView();
            },
        });
    }

    /** Принудительно запускает обработчик на всех открытых MarkdownView */
    private processCurrentView(): void {
        const leaves = this.app.workspace.getLeavesOfType("markdown");
        const processor = createImageProcessor(this.app.vault);

        for (const leaf of leaves) {
            const view = leaf.view;
            if (view instanceof MarkdownView) {
                processor(view.contentEl);
            }
        }
    }
}
