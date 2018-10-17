export interface JSONSchemaConst {

  /**
   * Checks if a value is strictly equal to this.
   * Can't be an object or array, as two objects or arrays are never equal.
   */
  const: string | number | boolean | null;

}

export interface JSONSchemaEnum {

  /**
   * Checks if a value is strictly equal to one of the value of enum.
   * Can't be an object or array, as two objects or arrays are never equal.
   */
  enum: (string | number | boolean | null)[];

}

export interface JSONSchemaBoolean {

  /**
   * Type for a boolean value.
   */
  type: 'boolean';

}

export interface JSONSchemaNull {

  /**
   * Type for a null value.
   */
  type: 'null';

}

export interface JSONSchemaString {

  /**
   * Type for a string value.
   */
  type: 'string';

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
   * Must be a valid regular expression, WITHOUT the / delimiters.
   */
  pattern?: string;

}

export interface JSONSchemaNumeric {

  type: 'number' | 'integer';

  /**
   * Check if a number is a multiple of x.
   * Must be strictly greater than 0.
   */
  multipleOf?: number;

  /**
   * Check if a number is less or equal than this maximum.
   */
  maximum?: number;

  /**
   * Check if a number is strictly less than this maximum.
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

export interface JSONSchemaArray {

  /**
   * Type for an array value. Avoid to explicit this, "items" is enough,
   */
  type?: 'array';

  /**
   * Schema for the values of an array.
   * 'type' of values should be a string (not an array of type).
   */
  items: JSONSchema | JSONSchema[];

  /**
   * Check if an array length is less or equal to this value.
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

export interface JSONSchemaObject {

  /**
   * Type for an object value.  Avoid to explicit this, "properties" is enough,
   */
  type?: 'object';

  /**
   * List of properties schemas for an object.
   */
  properties: {
    [k: string]: JSONSchema;
  };

  /**
   * Array of names of the required properties for an object.
   * Properties set as required should be present in 'properties' too.
   * Note that in the last spec, booleans are not supported anymore.
   */
  required?: string[];

}

/**
 * Subset of the JSON Schema.
 * Types are enforced to validate everything:
 * each value MUST have just ONE of either 'type' or 'properties' or 'items' or 'const' or 'enum'.
 * Therefore, unlike the spec, booleans are not allowed as schemas.
 * @see http://json-schema.org/latest/json-schema-validation.html
 * Not all validation features are supported: just follow the interface.
 */
export type JSONSchema = (JSONSchemaConst | JSONSchemaEnum |
  JSONSchemaBoolean | JSONSchemaNull | JSONSchemaString | JSONSchemaNumeric |
  JSONSchemaArray | JSONSchemaObject)
  & { [k: string]: any; };
