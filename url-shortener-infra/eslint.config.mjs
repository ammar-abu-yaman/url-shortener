import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.ts"]},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  eslintPluginPrettierRecommended,
  ...tseslint.configs.recommended,
];