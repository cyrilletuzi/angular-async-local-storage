/**
 * JSON Schema to describe a boolean value.
 * @ignore Internal type, **do not use**, use `JSONSchema` instead
 */
export interface JSONSchemaBoolean {

  /**
   * Type for a boolean value.
   */
  type: 'boolean';

  /**
   * Checks if a value is strictly equal to this.
   */
  const?: boolean;

}

/**
 * JSON Schema to describe a number value.
 * @ignore Internal type, **do not use**, use `JSONSchema` instead
 */
export interface JSONSchemaNumber {

  /**
   * Type for a numeric value.
   */
  type: 'number';

  /**
   * Checks if a value is strictly equal to this.
   */
  const?: number;

  /**
   * Checks if a value is strictly equal to one of the value of enum.
   */
  enum?: number[];

  /**
   * Check if a number is a multiple of x.
   * Must be strictly greater than 0.
   */
  multipleOf?: number;

  /**
   * Check if a number is lower or equal than this maximum.
   */
  maximum?: number;

  /**
   * Check if a number is strictly lower than this maximum.
   */
  exclusiveMaximum?: number;

  /**
   * Check if a number is greater or equal than this minimum.
   */
  minimum?: number;

  /**
   * Check if a number is strictly greater than this minimum.
   */
  exclusiveMinimum?: number;

}

/**
 * JSON Schema to describe an integer value.
 * @ignore Internal type, **do not use**, use `JSONSchema` instead
 */
export interface JSONSchemaInteger {

  /**
   * Type for an integer value.
   */
  type: 'integer';

  /**
   * Checks if a value is strictly equal to this.
   */
  const?: number;

  /**
   * Checks if a value is strictly equal to one of the value of enum.
   */
  enum?: number[];

  /**
   * Check if a number is a multiple of x.
   * Must be strictly greater than 0.
   */
  multipleOf?: number;

  /**
   * Check if a number is lower or equal than this maximum.
   */
  maximum?: number;

  /**
   * Check if a number is strictly lower than this maximum.
   */
  exclusiveMaximum?: number;

  /**
   * Check if a number is greater or equal than this minimum.
   */
  minimum?: number;

  /**
   * Check if a number is strictly greater than this minimum.
   */
  exclusiveMinimum?: number;

}

/**
 * JSON Schema to describe a string value.
 * @ignore Internal type, **do not use**, use `JSONSchema` instead
 */
export interface JSONSchemaString {

  /**
   * Type for a string value.
   */
  type: 'string';

  /**
   * Checks if a value is strictly equal to this.
   */
  const?: string;

  /**
   * Checks if a value is strictly equal to one of the value of enum.
   */
  enum?: string[];

  /**
   * Maxium length for a string.
   * Must be a non-negative integer.
   */
  maxLength?: number;

  /**
   * Minimum length for a string.
   * Must be a non-negative integer.
   */
  minLength?: number;

  /**
   * Pattern to match for a string.
   * Must be a valid regular expression, *without* the `/` delimiters.
   */
  pattern?: string;

}

/**
 * JSON schema to describe an array of values.
 * @ignore Internal type, **do not use**, use `JSONSchema` instead
 */
export interface JSONSchemaArray {

  /**
   * Type for an array of values.
   */
  type: 'array';

  /**
   * Schema for the values of an array.
   */
  items: JSONSchema;

  /**
   * Check if an array length is lower or equal to this value.
   * Must be a non negative integer.
   */
  maxItems?: number;

  /**
   * Check if an array length is greater or equal to this value.
   * Must be a non negative integer.
   */
  minItems?: number;

  /**
   * Check if an array only have unique values.
   */
  uniqueItems?: boolean;

}

/**
 * JSON Schema to describe an array of primitive values:
 * - array of booleans: `JSONSchemaArrayOf<JSONSchemaBoolean>`,
 * - array of numbers: `JSONSchemaArrayOf<JSONSchemaNumber>`,
 * - array of integers: `JSONSchemaArrayOf<JSONSchemaInteger>`,
 * - array of strings: `JSONSchemaArrayOf<JSONSchemaString>`.
 * @ignore Internal type, **do not use**, use `JSONSchema` instead
 */
export interface JSONSchemaArrayOf<T extends JSONSchemaBoolean | JSONSchemaNumber | JSONSchemaInteger | JSONSchemaString> {

  /**
   * Type for an array of values.
   */
  type: 'array';

  /**
   * Schema for the values of an array.
   */
  items: T;

  /**
   * Check if an array length is lower or equal to this value.
   * Must be a non negative integer.
   */
  maxItems?: number;

  /**
   * Check if an array length is greater or equal to this value.
   * Must be a non negative integer.
   */
  minItems?: number;

  /**
   * Check if an array only have unique values.
   */
  uniqueItems?: boolean;

}

/**
 * JSON schema to describe an object.
 * @ignore Internal type, **do not use**, use `JSONSchema` instead
 */
export interface JSONSchemaObject {

  /**
   * Type for an object.
   */
  type: 'object';

  /**
   * List of properties of the object and their associated JSON schemas.
   */
  properties: {
    [k: string]: JSONSchema;
  };

  /**
   * Array of names of the required properties for an object.
   * Properties set as required should be present in `properties` too.
   */
  required?: string[];

}

/**
 * @deprecated Available for backward-compatibility only, **do not use**, use `JSONSchema` instead.
 * May be removed in v9.
 */
export type JSONSchemaNumeric = JSONSchemaNumber | JSONSchemaInteger;

/**
 * Subset of the JSON Schema standard.
 * Types are enforced to validate everything: each value **must** have a `type`.
 * @see https://github.com/cyrilletuzi/angular-async-local-storage/blob/master/docs/VALIDATION.md
 */
export type JSONSchema = JSONSchemaString | JSONSchemaNumber | JSONSchemaInteger | JSONSchemaBoolean | JSONSchemaArray | JSONSchemaObject;
