import js from "@eslint/js";
import pluginTypeScript from "@typescript-eslint/eslint-plugin";
import prettierPlugin from "eslint-plugin-prettier/recommended";
import pluginImport from "eslint-plugin-import";
import pluginSimpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";

export default [
  {
    ignores: ["lib/**", "node_modules/**", "**/*.test.ts"],
  },
  js.configs.recommended,
  ...pluginTypeScript.configs["flat/recommended-type-checked"],
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json"],
      },
      globals: {
        ...globals.es2021,
        ...globals.node,
      },
    },
    plugins: {
      import: pluginImport,
      "simple-import-sort": pluginSimpleImportSort,
    },
    rules: {
      "prettier/prettier": "warn",
      "import/no-deprecated": "warn",
      "import/no-extraneous-dependencies": "error",
      "import/no-unassigned-import": "warn",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "prefer-const": "warn",
    },
  },
  prettierPlugin,
];
