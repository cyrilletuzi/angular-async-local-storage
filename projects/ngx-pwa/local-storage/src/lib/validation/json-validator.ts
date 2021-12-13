import { Injectable } from '@angular/core';

import {
  JSONSchema, JSONSchemaString, JSONSchemaInteger, JSONSchemaNumber, JSONSchemaBoolean,
  JSONSchemaArray, JSONSchemaObject
} from './json-schema';

@Injectable({
  providedIn: 'root'
})
export class JSONValidator {

  /**
   * Validate a JSON data against a Jsubset of the JSON Schema standard.
   * Types are enforced to validate everything: each schema must
   * @param data JSON data to validate
   * @param schema Subset of JSON Schema. Must have a `type`.
   * @returns If data is valid: `true`, if it is invalid: `false`
   * @see {@link https://github.com/cyrilletuzi/angular-async-local-storage/blob/main/docs/VALIDATION.md}
   */
  validate(data: unknown, schema: JSONSchema): boolean {

    switch (schema.type) {

      case 'string':
        return this.validateString(data, schema);
      case 'number':
      case 'integer':
        return this.validateNumber(data, schema);
      case 'boolean':
        return this.validateBoolean(data, schema);
      case 'array':
        return this.validateArray(data, schema);
      case 'object':
        return this.validateObject(data, schema);

    }

  }

  /**
   * Validate a string
   * @param data Data to validate
   * @param schema Schema describing the string
   * @returns If data is valid: `true`, if it is invalid: `false`
   */
  protected validateString(data: unknown, schema: JSONSchemaString): boolean {

    if (typeof data !== 'string') {
      return false;
    }

    if (!this.validateConst(data, schema)) {
      return false;
    }

    if (!this.validateEnum(data, schema)) {
      return false;
    }

    if ((schema.maxLength !== undefined) && (data.length > schema.maxLength)) {
      return false;
    }

    if ((schema.minLength !== undefined) && (data.length < schema.minLength)) {
      return false;
    }

    if (schema.pattern) {

      let regularExpression: RegExp | null = null;

      try {
        regularExpression = new RegExp(schema.pattern);
      } catch {
        // Nothing to do
      }

      if (regularExpression && !regularExpression.test(data)) {
        return false;
      }

    }

    return true;

  }

  /**
   * Validate a number or an integer
   * @param data Data to validate
   * @param schema Schema describing the number or integer
   * @returns If data is valid: `true`, if it is invalid: `false`
   */
  protected validateNumber(data: unknown, schema: JSONSchemaNumber | JSONSchemaInteger): boolean {

    if (typeof data !== 'number') {
      return false;
    }

    if ((schema.type === 'integer') && !Number.isInteger(data)) {
      return false;
    }

    if (!this.validateConst(data, schema)) {
      return false;
    }

    if (!this.validateEnum(data, schema)) {
      return false;
    }

    /* Test is done this way to not divide by 0 */
    if (schema.multipleOf && !Number.isInteger(data / schema.multipleOf)) {
      return false;
    }

    if ((schema.maximum !== undefined) && (data > schema.maximum)) {
        return false;
    }

    if ((schema.exclusiveMaximum !== undefined) && (data >= schema.exclusiveMaximum)) {
      return false;

    }

    if ((schema.minimum !== undefined) && (data < schema.minimum)) {
      return false;

    }

    if ((schema.exclusiveMinimum !== undefined) && (data <= schema.exclusiveMinimum)) {
        return false;
    }

    return true;

  }

  /**
   * Validate a boolean
   * @param data Data to validate
   * @param schema Schema describing the boolean
   * @returns If data is valid: `true`, if it is invalid: `false`
   */
  protected validateBoolean(data: unknown, schema: JSONSchemaBoolean): boolean {

    if (typeof data !== 'boolean') {
      return false;
    }

    if (!this.validateConst(data, schema)) {
      return false;
    }

    return true;

  }

  /**
   * Validate an array
   * @param data Data to validate
   * @param schema Schema describing the array
   * @returns If data is valid: `true`, if it is invalid: `false`
   */
  protected validateArray(data: unknown, schema: JSONSchemaArray): boolean {

    if (!Array.isArray(data)) {
      return false;
    }

    if ((schema.maxItems !== undefined) && (data.length > schema.maxItems)) {
      return false;
    }

    if ((schema.minItems !== undefined) && (data.length < schema.minItems)) {
      return false;
    }

    if (schema.uniqueItems) {

      /* Create a set to eliminate values with multiple occurences */
      const dataSet = new Set(data);

      if (data.length !== dataSet.size) {
        return false;
      }

    }

    /* Specific test for tuples */
    if (Array.isArray(schema.items)) {

      // TODO: cast should not be needed here
      return this.validateTuple(data, schema.items as JSONSchema[]);

    }

    /* Validate all the values in array */
    for (const value of data) {

      // TODO: remove when TypeScript 4.1 is available
      // (currently the narrowed type from `Array.isArray()` is lost on readonly arrays)
      if (!this.validate(value, schema.items as JSONSchema)) {
        return false;
      }

    }

    return true;

  }

  /**
   * Validate a tuple (array with fixed length and multiple types)
   * @param data Data to validate
   * @param schemas Schemas describing the tuple
   * @returns If data is valid: `true`, if it is invalid: `false`
   */
  protected validateTuple(data: unknown[], schemas: JSONSchema[]): boolean {

    /* Tuples have a fixed length */
    if (data.length !== schemas.length) {

      return false;

    }

    for (let i = 0; i < schemas.length; i += 1) {

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (!this.validate(data[i], schemas[i]!)) {
        return false;
      }

    }

    return true;

  }

  /**
   * Validate an object
   * @param data Data to validate
   * @param schema JSON schema describing the object
   * @returns If data is valid: `true`, if it is invalid: `false`
   */
  protected validateObject(data: unknown, schema: JSONSchemaObject): boolean {

    /* Check the type and if not `null` as `null` also have the type `object` in old browsers */
    if ((typeof data !== 'object') || (data === null)) {
      return false;
    }

    /* Check if the object doesn't have more properties than expected
     * Equivalent of `additionalProperties: false`
     */
    if (Object.keys(schema.properties).length < Object.keys(data).length) {
      return false;
    }

    /* Validate required properties */
    if (schema.required) {

      for (const requiredProp of schema.required) {

        if (!Object.prototype.hasOwnProperty.call(data, requiredProp)) {
          return false;
        }

      }

    }

    /* Recursively validate all properties */
    for (const property in schema.properties) {

      /* Filter to keep only real properties (no internal JS stuff) and check if the data has the property too */
      if (Object.prototype.hasOwnProperty.call(schema.properties, property) && Object.prototype.hasOwnProperty.call(data, property)) {

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (!this.validate((data as { [k: string]: unknown; })[property], schema.properties[property]!)) {
          return false;
        }

      }

    }

    return true;

  }

  /**
   * Validate a constant
   * @param data Data ta validate
   * @param schema JSON schema describing the constant
   * @returns If data is valid: `true`, if it is invalid: `false`
   */
  protected validateConst(data: unknown, schema: JSONSchemaBoolean | JSONSchemaInteger | JSONSchemaNumber | JSONSchemaString): boolean {

    if (!schema.const) {
      return true;
    }

    return (data === schema.const);

  }

  /**
   * Validate an enum
   * @param data Data ta validate
   * @param schema JSON schema describing the enum
   * @returns If data is valid: `true`, if it is invalid: `false`
   */
  protected validateEnum(data: unknown, schema: JSONSchemaInteger | JSONSchemaNumber | JSONSchemaString): boolean {

    if (!schema.enum) {
      return true;
    }

    /* Cast as the data can be of multiple types, and so TypeScript is lost */
    return ((schema.enum as unknown[]).includes(data));

  }

}
