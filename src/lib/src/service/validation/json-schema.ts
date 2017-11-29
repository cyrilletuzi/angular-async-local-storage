/**
 * Types allowed in a JSON Schema
 */
export type JSONSchemaType = 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'null';

/**
 * Subset of the JSON Schema draft 6.
 * Types are enforced to validate everything : each value MUST have either 'type' or 'properties' or 'items'.
 * Therefore, unlike the spec, booleans are not allowed as schemas.
 * @todo Not all validation features are supported yet : just follow the interface.
 */
export interface JSONSchema {

  /**
   * Type for a primitive value.
   * Not required for objects, just set 'properties'.
   * Not required for arrays, just set 'items'.
   * @see http://json-schema.org/latest/json-schema-validation.html#rfc.section.6.25
   */
  type?: JSONSchemaType | JSONSchemaType[];

  /**
   * List of properties schemas for an object.
   * @see http://json-schema.org/latest/json-schema-validation.html#rfc.section.6.18
   */
  properties?: {
    [k: string]: JSONSchema;
  };

  /**
   * Array of names of the required properties for an object.
   * Properties set as required should be present in 'properties' too.
   * Note that in the last spec, booleans are not supported anymore.
   * @see http://json-schema.org/latest/json-schema-validation.html#rfc.section.6.17
   */
  required?: string[];

  /**
   * Schema for the values of an array.
   * 'type' of values should be a string (not an array of type).
   * @see http://json-schema.org/latest/json-schema-validation.html#rfc.section.6.4.1
   */
  items?: JSONSchema | JSONSchema[];

  /**
   * Allow other properties, to not fail with existing JSON schemas.
   */
  [k: string]: any;

}
