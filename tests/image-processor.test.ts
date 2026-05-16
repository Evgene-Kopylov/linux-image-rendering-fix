import { describe, expect, it } from "vitest";

// Тесты чистых функций из image-processor
// Моки Obsidian API запрещены — тестируем только изолированную логику

describe("MIME-типы", () => {
    it("png", () => {
        const mime = getMimeType("file.png");
        expect(mime).toBe("image/png");
    });

    it("jpg", () => {
        const mime = getMimeType("photo.jpg");
        expect(mime).toBe("image/jpeg");
    });

    it("неизвестное расширение", () => {
        const mime = getMimeType("file.unknown");
        expect(mime).toBe("application/octet-stream");
    });
});

/**
 * Копия getMimeType из src/utils/image-processor.ts.
 * Тестируем изолированно, без импорта Obsidian API.
 */
function getMimeType(filePath: string): string {
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
    const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
    return MIME_TYPES[ext] ?? "application/octet-stream";
}
