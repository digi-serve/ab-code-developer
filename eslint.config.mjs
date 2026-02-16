//   ╔═╗╔═╗╦  ╦╔╗╔╔╦╗┬─┐┌─┐
//   ║╣ ╚═╗║  ║║║║ ║ ├┬┘│
//  o╚═╝╚═╝╩═╝╩╝╚╝ ╩ ┴└─└─┘
// Flat config for ESLint v9+. Replaces .eslintrc.js and nested configs.
import js from "@eslint/js";
import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import eslintPluginPrettier from "eslint-plugin-prettier";

export default [
   { ignores: ["**/node_modules/**"] },

   js.configs.recommended,

   // Main project: Node + ES2022, Prettier, custom rules
   {
      files: ["**/*.js"],
      languageOptions: {
         ecmaVersion: 2022,
         globals: { ...globals.node },
      },
      plugins: { prettier: eslintPluginPrettier },
      rules: {
         "prettier/prettier": [
            "error",
            {
               arrowParens: "always",
               endOfLine: "lf",
               printWidth: 80,
               tabWidth: 3,
               trailingComma: "all",
            },
         ],
         "no-console": "off", // allow console.log() in our services
      },
   },

   // // Browser assets (e.g. api_sails): browser globals
   // {
   //    files: ["**/api_sails/assets/**/*.js"],
   //    languageOptions: {
   //       ecmaVersion: 2022,
   //       globals: { ...globals.browser },
   //    },
   // },

   // Test files: Mocha globals + no-unused-vars ignore for should/expect
   {
      files: ["**/test/**/*.js"],
      languageOptions: {
         globals: { ...globals.node, ...globals.mocha },
      },
      rules: {
         "no-unused-vars": ["error", { varsIgnorePattern: "should|expect" }],
      },
   },

   // Prettier disables conflicting rules — must be last
   eslintConfigPrettier,
];
