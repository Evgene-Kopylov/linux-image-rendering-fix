import type { FileSystemAdapter, Vault } from "obsidian";

/** MIME-типы по расширениям файлов */
const MIME_TYPES: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    bmp: "image/bmp",
    ico: "image/x-icon",
};

/** Расширения файлов изображений */
export const IMAGE_EXTENSIONS = new Set(Object.keys(MIME_TYPES));

/**
 * Извлекает путь к файлу из src изображения Obsidian.
 * Поддерживает форматы:
 *   - app://local/path/to/file.jpg
 *   - vault://path/to/file.jpg
 * Возвращает путь относительно корня хранилища.
 */
function extractVaultPath(src: string): string | null {
    // app://<hash>/path/to/file.jpg?...
    const appMatch = src.match(/^app:\/\/[^/]+\/(.+?)(?:\?|$)/);
    if (appMatch?.[1]) {
        return decodeURIComponent(appMatch[1]);
    }

    return null;
}

/**
 * Определяет MIME-тип по пути файла.
 */
function getMimeType(filePath: string): string {
    const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
    return MIME_TYPES[ext] ?? "application/octet-stream";
}

/**
 * Создаёт Blob URL из ArrayBuffer.
 */
function createBlobUrl(buffer: ArrayBuffer, mimeType: string): string {
    const blob = new Blob([buffer], { type: mimeType });
    return URL.createObjectURL(blob);
}

/**
 * Обрабатывает один элемент img: читает файл из хранилища
 * и заменяет src на Blob URL.
 */
async function processImage(
    img: HTMLImageElement,
    vault: Vault,
): Promise<void> {
    const src = img.getAttribute("src");
    if (!src) return;

    // Пропускаем уже обработанные (blob URL) и внешние URL
    if (src.startsWith("blob:") || src.startsWith("http")) return;

    let vaultPath = extractVaultPath(src);
    if (!vaultPath) {
        return;
    }

    // Если путь абсолютный — обрезаем корень хранилища
    const adapter = vault.adapter as FileSystemAdapter;
    const basePath = adapter.getBasePath();
    // Нормализуем: убираем ведущий / у обоих
    const normBase = basePath.replace(/^\/+/, "");
    const normPath = vaultPath.replace(/^\/+/, "");
    if (normPath.startsWith(normBase)) {
        vaultPath = normPath.slice(normBase.length).replace(/^\/+/, "");
    }

    try {
        const fileStat = await vault.adapter.stat(vaultPath);
        if (!fileStat) {
            return;
        }

        const buffer = await vault.adapter.readBinary(vaultPath);
        const mimeType = getMimeType(vaultPath);
        const blobUrl = createBlobUrl(buffer, mimeType);

        img.setAttribute("src", blobUrl);
        img.setAttribute("data-image-renderer", "processed");
    } catch (error) {
        console.error(`[ImageRenderer] Ошибка обработки ${vaultPath}:`, error);
    }
}

/**
 * Создаёт MarkdownPostProcessor для перехвата изображений.
 * Вызывается после рендеринга markdown, находит все img
 * и заменяет их src на Blob URL (бинарные данные из хранилища).
 */
export function createImageProcessor(vault: Vault): (el: HTMLElement) => void {
    return (el: HTMLElement) => {
        // Сам элемент может быть img (превью при наведении)
        if (el.instanceOf(HTMLImageElement)) {
            void processImage(el, vault);
        }

        const images = el.findAll("img");
        for (const img of images) {
            if (img.instanceOf(HTMLImageElement)) {
                void processImage(img, vault);
            }
        }
    };
}
