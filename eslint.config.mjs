import js from "@eslint/js";
import nextConfig from "@next/eslint-plugin-next";

export default [
  {
    ignores: [
      ".next/**/*",
      "node_modules/**/*"
    ]
  },
  js.configs.recommended,
  {
    plugins: {
      "@next/next": nextConfig,
    },
    rules: {
      ...nextConfig.configs.recommended.rules,
      ...nextConfig.configs["core-web-vitals"].rules,
    },
  },
];
