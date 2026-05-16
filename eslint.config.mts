import tseslint from "typescript-eslint";
import obsidianmd from "eslint-plugin-obsidianmd";
import globals from "globals";
import { globalIgnores } from "eslint/config";
import eslintComments from "@eslint-community/eslint-plugin-eslint-comments";

export default tseslint.config(
    {
        languageOptions: {
            globals: {
                ...globals.browser,
            },
            parserOptions: {
                projectService: {
                    allowDefaultProject: [
                        "eslint.config.js",
                        "manifest.json",
                        "vitest.config.ts",
                    ],
                },
                tsconfigRootDir: import.meta.dirname,
                extraFileExtensions: [".json"],
            },
        },
    },
    ...obsidianmd.configs.recommended,
    {
        files: ["src/**/*.ts"],
        plugins: {
            "@typescript-eslint": tseslint.plugin,
            "eslint-comments": eslintComments,
        },
        rules: {
            // Строгие правила типизации
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-unsafe-assignment": "error",
            "@typescript-eslint/no-unsafe-argument": "error",
            "@typescript-eslint/no-unsafe-call": "error",
            "@typescript-eslint/no-unsafe-member-access": "error",
            "@typescript-eslint/require-await": "error",

            // Правила для eslint-disable директив
            "eslint-comments/require-description": "error",
            "eslint-comments/disable-enable-pair": "error",
            "eslint-comments/no-unused-disable": "error",
            "eslint-comments/no-restricted-disable": [
                "error",
                "@typescript-eslint/no-explicit-any",
                "obsidianmd/no-static-styles-assignment",
                "obsidianmd/hardcoded-config-path",
                "obsidianmd/prefer-active-doc",
                "obsidianmd/prefer-active-window-timers",
                "obsidianmd/prefer-create-el",
                "no-console",
            ],

            // Правила совместимости с popout windows
            "obsidianmd/prefer-active-doc": "error",
            "obsidianmd/prefer-active-window-timers": "error",
        },
    },
    globalIgnores([
        "*.cjs",
        "*.js",
        "*.mjs",
        "dist",
        "esbuild.config.mjs",
        "eslint.config.js",
        "eslint.config.mts",
        "main.js",
        "node_modules",
        "scripts/",
        "tests/",
        "vitest.config.ts",
        "version-bump.mjs",
        "versions.json",
    ]),
);
