// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angulareslint = require("angular-eslint");

module.exports = defineConfig(
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    extends: [
      eslint.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      angulareslint.configs.tsRecommended,
    ],
    processor: angulareslint.processInlineTemplates,
    rules: {
      "@angular-eslint/component-class-suffix": "off",
      // Prefixes
      "@angular-eslint/component-selector": [
        "error",
        {
          "type": "element",
          "prefix": "app",
          "style": "kebab-case"
        }
      ],
      "@angular-eslint/directive-selector": [
        "error",
        {
          "type": "attribute",
          "prefix": "app",
          "style": "camelCase"
        }
      ],
      // Enforce modern JavaScript
      "prefer-template": "error",
      "prefer-arrow-callback": "error",
      // Stricter JavaScript
      "no-new-native-nonconstructor": "error",
      "no-constant-binary-expression": "error",
      "prefer-object-has-own": "error", // ES2022+
      // Strict types
      "eqeqeq": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/use-unknown-in-catch-callback-variable": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/restrict-plus-operands": ["error", {
        allowAny: false,
        allowBoolean: false,
        allowNullish: false,
        allowNumberAndString: false,
        allowRegExp: false,
      }],
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/strict-boolean-expressions": ["error", {
        allowNumber: false,
        allowString: false,
      }],
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/prefer-for-of": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/restrict-template-expressions": "error",
      "no-shadow": "off",
      "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/no-useless-empty-export": "error",
      "@typescript-eslint/no-unsafe-type-assertion": "error",
      "@typescript-eslint/no-useless-default-assignment": "error",
      "@typescript-eslint/strict-void-return": "error",
      // Stricter Angular ESLint rules
      "@angular-eslint/prefer-standalone": "off",
      "@angular-eslint/consistent-component-styles": "error",
      "@angular-eslint/sort-lifecycle-methods": "error",
      "@angular-eslint/contextual-decorator": "error",
      "@angular-eslint/no-attribute-decorator": "error",
      "@angular-eslint/no-input-prefix": "error",
      "@angular-eslint/no-lifecycle-call": "error",
      "@angular-eslint/no-pipe-impure": "error",
      "@angular-eslint/no-queries-metadata-property": "error",
      "@angular-eslint/use-component-view-encapsulation": "error",
      "@angular-eslint/use-injectable-provided-in": "error",
      "@angular-eslint/no-async-lifecycle-method": "error",
      // Stricter RxJS (disabled until package is updated)
      // "rxjs/no-exposed-subjects": "warn", // should be error in a real project
      // "rxjs/no-subclass": "error",
      // "rxjs/no-subject-value": "error",
      // "rxjs/no-topromise": "error",
      // "rxjs/no-unsafe-catch": "error",
      // "rxjs/no-unsafe-first": "error",
      // "rxjs/no-unsafe-switchmap": "error",
      // "rxjs/throw-error": "error",
      // Loosen some annoying and inadequate empty rules
      "no-empty": [
        "error",
        {
          allowEmptyCatch: true, // `catch` is required after a `try`, but there is not always something to do inside
        },
      ],
      "@typescript-eslint/no-empty-function": [
        "error",
        {
          allow: ["arrowFunctions"], // some callbacks are required (like in promises `.catch()`), but there is not always something to do inside
        },
      ],
      "@typescript-eslint/no-empty-object-type": [
        "error",
        {
          allowInterfaces: "with-single-extends",
        },
      ],
      "@typescript-eslint/no-extraneous-class": [
        "error",
        {
          allowWithDecorator: true, // some Angular classes can be empty
        },
      ],
      // Allow Angular forms validators like `Validator.required`
      "@typescript-eslint/unbound-method": [
        "error",
        {
          "ignoreStatic": true
        }
      ],
      // Disallow some imports
      "no-restricted-imports": [
        "error",
        {
          "paths": [
            // Disallow imports from entry points inside a module (`.` = `./index`)
            ".",
            "..",
            "../..",
            "../../.."
          ],
          "patterns": [
            // Disallow imports forbidden folders
            "dist/*",
            // Disallow imports from another application
            "testing-apps/*"
          ]
        }
      ]
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angulareslint.configs.templateRecommended,
      ...angulareslint.configs.templateAccessibility,
    ],
    rules: {
      // Strict types
      "@angular-eslint/template/no-any": "error",
      // Stricter Anguler ESLint rules
      "@angular-eslint/template/prefer-control-flow": "error",
      "@angular-eslint/template/prefer-self-closing-tags": "warn",
      "@angular-eslint/template/attributes-order": "warn",
      "@angular-eslint/template/conditional-complexity": "error",
      "@angular-eslint/template/no-duplicate-attributes": "error",
      "@angular-eslint/template/no-interpolation-in-attributes": "error",
      "@angular-eslint/template/prefer-static-string-properties": "error",
      "@angular-eslint/template/prefer-contextual-for-variables": "error",
      "@angular-eslint/template/no-inline-styles": [
        "error",
        {
          "allowNgStyle": true,
          "allowBindToStyle": true
        }
      ],
      "@angular-eslint/template/button-has-type": "error",
      // More accessibility
      "@angular-eslint/template/no-positive-tabindex": "error"
    }
  },
  {
    files: ['**/*.js'],
    ...tseslint.configs.disableTypeChecked,
  },
);
