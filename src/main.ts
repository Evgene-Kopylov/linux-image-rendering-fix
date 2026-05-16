import { MarkdownView, Plugin } from "obsidian";
import { DEFAULT_SETTINGS, ImageRendererSettingTab } from "./settings";
import type { ImageRendererSettings } from "./types";
import { createImageProcessor } from "./utils/image-processor";

/**
 * Плагин Image Renderer для Obsidian
 * Исправляет проблемы отображения изображений на Linux
 */
export default class ImageRendererPlugin extends Plugin {
    settings: ImageRendererSettings;

    async onload(): Promise<void> {
        await this.loadSettings();
        this.addSettingTab(new ImageRendererSettingTab(this.app, this));

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

    async loadSettings(): Promise<void> {
        const data: unknown = await this.loadData();
        const partial = data as Partial<ImageRendererSettings> | undefined;
        this.settings = { ...DEFAULT_SETTINGS, ...partial };
    }

    async saveSettings(): Promise<void> {
        await this.saveData(this.settings);
    }
}
