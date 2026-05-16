import { App, PluginSettingTab, Setting } from "obsidian";
import type ImageRendererPlugin from "./main";
import type { ImageRendererSettings } from "./types";

/** Настройки плагина по умолчанию */
export const DEFAULT_SETTINGS: ImageRendererSettings = {
    debug: false,
    maxImageSizeMB: 50,
};

/** Вкладка настроек плагина */
export class ImageRendererSettingTab extends PluginSettingTab {
    plugin: ImageRendererPlugin;

    constructor(app: App, plugin: ImageRendererPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName("Режим отладки")
            .setDesc("Включить подробное логирование обработки изображений")
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.debug)
                    .onChange(async (value) => {
                        this.plugin.settings.debug = value;
                        await this.plugin.saveSettings();
                    }),
            );

        new Setting(containerEl)
            .setName("Максимальный размер изображения (МБ)")
            .setDesc("Изображения больше этого размера не будут обрабатываться")
            .addText((text) =>
                text
                    .setPlaceholder("50")
                    .setValue(String(this.plugin.settings.maxImageSizeMB))
                    .onChange(async (value) => {
                        const num = Number(value);
                        if (!isNaN(num) && num > 0) {
                            this.plugin.settings.maxImageSizeMB = num;
                            await this.plugin.saveSettings();
                        }
                    }),
            );
    }
}
