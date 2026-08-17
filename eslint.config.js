// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angulareslint = require("angular-eslint");
const angularModern = require("eslint-plugin-angular-modern");

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
      angularModern.configs.recommended,
    ],
    processor: angulareslint.processInlineTemplates,
    rules: {
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
      "prefer-object-has-own": "error", // ES2022+
      "prefer-object-spread": "error",
      "object-shorthand": "error",
      // Security
      "no-eval": "error",
      "no-script-url": "error",
      "no-extend-native": "error",
      // Performance
      "no-await-in-loop": "error",
      // Disallow confusing syntaxes
      "no-new-native-nonconstructor": "error",
      "no-constant-binary-expression": "error",
      "no-bitwise": "error",
      "no-caller": "error",
      "array-callback-return": "error",
      "no-new-wrappers": "error",
      "no-self-compare": "error",
      "no-template-curly-in-string": "error",
      "no-unmodified-loop-condition": "error",
      "curly": "error",
      "no-alert": "error",
      "no-use-before-define": "off",
      "@typescript-eslint/no-use-before-define": "error",
      "no-shadow": "off",
      "@typescript-eslint/no-shadow": "error",
      "no-invalid-this": "off",
      "@typescript-eslint/no-invalid-this": "error",
      // Strict types
      "eqeqeq": "error",
      "prefer-template": "error",
      "prefer-arrow-callback": "error",
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
      "@typescript-eslint/no-useless-empty-export": "error",
      "@typescript-eslint/no-unsafe-type-assertion": "error",
      "@typescript-eslint/no-useless-default-assignment": "error",
      "@typescript-eslint/strict-void-return": "error",
      // Immutability
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/prefer-readonly-parameter-types": ["error", {
        "ignoreInferredTypes": true,
        "treatMethodsAsReadonly": true,
      }],
      // Disable recommended Angular ESLint rules already managed by other rules
      "@angular-eslint/contextual-lifecycle": "off",
      "@angular-eslint/no-empty-lifecycle-method": "off",
      "@angular-eslint/prefer-on-push-component-change-detection": "off",
      "@angular-eslint/prefer-inject": "off",
      "@angular-eslint/prefer-standalone": "off",
      "@angular-eslint/use-lifecycle-interface": "off",
      // More Angular ESLint rules
      "@angular-eslint/computed-must-return": "error",
      "@angular-eslint/consistent-component-styles": "error",
      "@angular-eslint/no-developer-preview": "error",
      "@angular-eslint/no-duplicates-in-metadata-arrays": "error",
      "@angular-eslint/no-experimental": "error",
      "@angular-eslint/no-input-prefix": "error",
      "@angular-eslint/no-output-native": "error",
      "@angular-eslint/no-output-on-prefix": "error",
      "@angular-eslint/no-output-rename": "error",
      "@angular-eslint/no-outputs-metadata-property": "error",
      "@angular-eslint/no-pipe-impure": "error",
      "@angular-eslint/no-queries-metadata-property": "error",
      "@angular-eslint/pipe-prefix": "error",
      "@angular-eslint/prefer-output-readonly": "error",
      "@angular-eslint/prefer-signal-model": "error",
      "@angular-eslint/relative-url-prefix": "error",
      "@angular-eslint/sort-keys-in-type-decorator": "error",
      "@angular-eslint/use-component-selector": "error",
      "@angular-eslint/use-component-view-encapsulation": "error",
      /* Injection context */
      "eslint-plugin-angular-modern/custom-function-in-injection-context": ["error", {
        "functions": [{
          "name": "localDatabaseFactory",
          "allowedSpecialInjectionContexts": ["factory"],
        }],
      }],
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
      // Avoid empty imports which could cause empty files during build
      "@typescript-eslint/no-import-type-side-effects": "error",
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
      "@angular-eslint/template/no-non-null-assertion": "error",
      "@angular-eslint/template/eqeqeq": "error",
      // Disable recommended Angular ESLint rules already managed by other rules
      "@angular-eslint/template/banana-in-box": "off",
      "@angular-eslint/template/prefer-control-flow": "off",
      "@angular-eslint/template/no-negated-async": "off",
      // Stricter Anguler ESLint rules
      "@angular-eslint/template/attributes-order": "error",
      "@angular-eslint/template/conditional-complexity": "error",
      "@angular-eslint/template/cyclomatic-complexity": "error",
      "@angular-eslint/template/no-duplicate-attributes": "error",
      "@angular-eslint/template/no-empty-control-flow": "error",
      "@angular-eslint/template/no-inline-styles": [
        "error",
        {
          "allowBindToStyle": true
        }
      ],
      "@angular-eslint/template/no-interpolation-in-attributes": "error",
      "@angular-eslint/template/no-nested-tags": "error",
      "@angular-eslint/template/no-outerhtml": "error",
      "@angular-eslint/template/prefer-at-else": "error",
      "@angular-eslint/template/prefer-at-empty": "error",
      "@angular-eslint/template/prefer-built-in-pipes": "error",
      "@angular-eslint/template/prefer-contextual-for-variables": "error",
      "@angular-eslint/template/prefer-self-closing-tags": "error",
      "@angular-eslint/template/prefer-static-string-properties": "error",
      "@angular-eslint/template/prefer-template-literal": "error",
      "@angular-eslint/template/require-switch-default": "error",
      // More accessibility
      "@angular-eslint/template/button-has-type": "error",
      "@angular-eslint/template/no-positive-tabindex": "error",
    }
  },
  {
    files: ["**/*.js"],
    ...tseslint.configs.disableTypeChecked,
  },
);
