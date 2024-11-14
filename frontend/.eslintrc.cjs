const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    "prettier",
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: [
    'react-refresh',
    'import',
    'perfectionist',
    'prettier',
  ],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }
    ],
    // perfectionist rules
    "perfectionist/sort-named-imports": isDevelopment ? "off" : [
      "error",
      {
        "order": "asc",
        "type": "line-length"
      }
    ],
    "perfectionist/sort-named-exports": isDevelopment ? "off" : [
      "error",
      {
        "order": "asc",
        "type": "line-length"
      }
    ],
    "perfectionist/sort-exports": isDevelopment ? "off" : [
      "error",
      {
        "order": "asc",
        "type": "line-length"
      }
    ],
    "perfectionist/sort-imports": isDevelopment ? "off" : [
      "error",
      {
        "order": "asc",
        "type": "line-length",
        "newlines-between": "always",
        "groups": [
          [
            "builtin",
            "external"
          ],
          "custom-mui",
          "custom-routes",
          "custom-hooks",
          "custom-utils",
          "internal",
          "custom-components",
          "custom-sections",
          "custom-types",
          [
            "parent",
            "sibling",
            "index"
          ],
          "object",
          "unknown"
        ],
        "custom-groups": {
          "value": {
            "custom-mui": "@mui/**",
            "custom-routes": "src/routes/**",
            "custom-hooks": "src/hooks/**",
            "custom-utils": "src/utils/**",
            "custom-components": "src/components/**",
            "custom-sections": "src/sections/**",
            "custom-types": "src/types/**"
          }
        },
        "internal-pattern": [
          "src/**"
        ]
      }
    ],
  },
}
