import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
    test: {
        environment: "jsdom",
        include: ["tests/**/*.test.ts"],
        exclude: ["node_modules"],
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
            include: ["src/**/*.ts"],
            exclude: [
                "src/main.ts",
                "src/**/*.d.ts",
                "src/**/index.ts",
                "src/**/types.ts",
            ],
        },
        setupFiles: ["./tests/setup.ts"],
        globals: true,
    },
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
            obsidian: resolve(__dirname, "tests/__mocks__/obsidian.ts"),
        },
    },
});
