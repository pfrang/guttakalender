
export default {
    plugins: ["@trivago/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],
    printWidth: 120,
    semi: true,
    arrowParens: "always",
    singleQuote: false,
    trailingComma: "es5",
    bracketSpacing: true,
    tabWidth: 4,
    importOrder: ["<THIRD_PARTY_MODULES>", "^@repo/(.*)$", "^@/lib/(.*)$", "^\\.\\./", "^\\./"],
    importOrderSeparation: true,
    tailwindStylesheet: "./src/index.css",
};
