import { Notice, Plugin } from "obsidian";
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

        // Команда для проверки работоспособности плагина
        this.addCommand({
            id: "check-status",
            name: "Check status",
            callback: () => {
                new Notice("Image renderer plugin is active");
            },
        });
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
