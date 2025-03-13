import globals from "globals";
import pluginJs from "@eslint/js";
import jest from "eslint-plugin-jest";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: { 
      globals: { ...globals.browser, ...globals.jest, ...globals.node },
    },
    plugins: {jest},    
  },
  pluginJs.configs.recommended,
  {
    rules: {
      ...jest.configs.recommended.rules,
      "quotes": ["error", "double"],
      "curly": ["error", "multi"], // Ensure multi-line if statements break correctly
      "brace-style": ["error", "stroustrup", { allowSingleLine: false }], // Prevent single-line if statements
      "indent": ["error", 2, { "SwitchCase": 1 }], // Enforce 2-space indentation
      "operator-linebreak": ["error", "before"], // Align && and || to the next line for readability
    },
  },  
];