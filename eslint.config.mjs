import js from "@eslint/js";
import { configs } from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import * as pluginImportX from "eslint-plugin-import-x";
import globals from "globals";
import { defineConfig } from "eslint/config";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,jsx,ts,mts,tsx}"],
    ignores: ["bin/**/*"],
    plugins: { js },
    extends: ["js/recommended"],
    settings: {
      react: {
        version: "detect",
      },
      "import-x/resolver-next": [
        createTypeScriptImportResolver({
          alwaysTryTypes: true,
        }),
      ],
    },
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"],
  pluginImportX.flatConfigs.recommended,
  pluginImportX.flatConfigs.typescript,
  pluginImportX.flatConfigs.react,
  eslintConfigPrettier,
  {
    rules: {
      "import-x/extensions": ["error"],
    },
  },
]);
