import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";

export default [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "scripts/**",
      "public/**",
      "dist/**",
      "coverage/**",
      "*.d.ts"
    ],
  },
  js.configs.recommended,
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "no-unused-vars": "off",
      "no-undef": "off",
      "no-empty": "off",
      "no-cond-assign": "off",
    },
  },
];
