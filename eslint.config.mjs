import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import nextPlugin from "@next/eslint-plugin-next";

const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(new URL(".", import.meta.url));

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: {},
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          varsIgnorePattern:
            "^(findSimilarChannelsWithPerplexity|getDetailedChannelInfo)$",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@next/next/no-img-element": "off",
      "@next/next/no-page-custom-font": "off",
      "react/no-unescaped-entities": "warn",
    },
  },
];

export default eslintConfig;
