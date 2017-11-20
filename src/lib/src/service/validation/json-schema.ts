/**
 * Subset of the JSON Schema draft 6.
 * Not all features are supported : just follow the interface and it will be OK.
 * Unlike the spec, a value MUST have either 'type' or 'properties' (to enforce strict types).
 */
export interface JSONSchema {

  /**
   * Type for a value.
   * Not required for objects, just set 'properties' and/or 'required'.
   * Not required for arrays, just set 'items'.
   * Unlike spec, an array of types is not supported yet.
   * @see http://json-schema.org/latest/json-schema-validation.html#rfc.section.6.25
   */
  type?: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'null';

  /**
   * Array of the names of the required properties for an object.
   * Properties set as required should be present in 'properties' too (to enforce strict types).
   * Note that in the last spec, booleans are not supported anymore.
   * @see http://json-schema.org/latest/json-schema-validation.html#rfc.section.6.17
   */
  required?: string[];

  /**
   * List of properties for an object.
   * Unlike the spec, booleans are not supported (to enforce strict types).
   * @see http://json-schema.org/latest/json-schema-validation.html#rfc.section.6.18
   */
  properties?: {
    [k: string]: JSONSchema;
  };

  /**
   * Schema to describe the values of the array.
   * Unlike the spec, only one type is authorized (to enforce strict types).
   */
  items?: JSONSchema;

  /**
   * Allow other properties, to not fail with existing JSON schemas.
   */
  [k: string]: any;

}
