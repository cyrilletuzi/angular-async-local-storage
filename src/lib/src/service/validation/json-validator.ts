import { Injectable } from '@angular/core';
import { JSONSchema, JSONSchemaType } from './json-schema';

/**
 * @todo Add other JSON Schema validation features
 */
@Injectable({
  providedIn: 'root'
})
export class JSONValidator {

  /**
   * Validate a JSON data against a JSON Schema
   * @param data JSON data to validate
   * @param schema Subset of JSON Schema
   * @returns If data is valid : true, if it is invalid : false, and throws if the schema is invalid
   */
  validate(data: any, schema: JSONSchema): boolean {

    if (!this.isObjectNotNull(schema)) {

      throw new Error(`A schema must be an object (unlike spec, booleans are not supported to enforce strict types).`);

    }

    if (((!schema.hasOwnProperty('const') && !schema.hasOwnProperty('enum') && !schema.hasOwnProperty('type'))
    || schema.type === 'array' || schema.type === 'object')
    && !schema.hasOwnProperty('properties') && !schema.hasOwnProperty('items')) {

      throw new Error(`Each value must have a 'type' or 'properties' or 'items' or 'const' or 'enum', to enforce strict types.`);

    }

    if (schema.hasOwnProperty('const') && (data !== schema.const)) {
      return false;
    }

    if (schema.hasOwnProperty('enum') && !this.validateEnum(data, schema)) {
      return false;
    }

    if (schema.hasOwnProperty('type') && !this.validateType(data, schema)) {
      return false;
    }

    if (schema.hasOwnProperty('items') && !this.validateItems(data, schema)) {
      return false;
    }

    if (schema.hasOwnProperty('properties')) {

      if (schema.hasOwnProperty('required') && !this.validateRequired(data, schema)) {
        return false;
      }

      if (!this.validateProperties(data, schema)) {
        return false;
      }

    }

    return true;

  }

  protected isObjectNotNull(value: any): boolean {

    return (value !== null) && (typeof value === 'object');

  }

  protected validateProperties(data: {}, schema: JSONSchema): boolean {

    if (!this.isObjectNotNull(data)) {

      return false;

    }

    if (!schema.properties || !this.isObjectNotNull(schema.properties)) {

      throw new Error(`'properties' must be a schema object.`);

    }

    /**
     * Check if the object doesn't have more properties than expected
     * Equivalent of additionalProperties: false
     */
    if (Object.keys(schema.properties).length !== Object.keys(data).length) {

      return false;

    }

    /* Recursively validate all properties */
    for (let property in schema.properties) {

      if (schema.properties.hasOwnProperty(property) && data.hasOwnProperty(property)) {

        if (!this.validate(data[property], schema.properties[property])) {

          return false;

        }

      }

    }

    return true;

  }

  protected validateRequired(data: {}, schema: JSONSchema): boolean {

    if (!this.isObjectNotNull(data)) {

      return false;

    }

    if (!Array.isArray(schema.required)) {

      throw new Error(`'required' field must be an array. Note that since JSON Schema draft 6, booleans are not supported anymore.`);

    }

    for (let requiredProp of schema.required) {

      if (typeof requiredProp !== 'string') {

        throw new Error(`'required' array must contain strings only.`);

      }

      /* Checks if the property is present in the schema 'properties' */
      if (!schema.properties || !schema.properties.hasOwnProperty(requiredProp)) {

        throw new Error(`'required' properties must be described in 'properties' too.`);

      }

      /* Checks if the property is present in the data */
      if (!data.hasOwnProperty(requiredProp)) {

        return false;

      }

    }

    return true;

  }

  protected validateEnum(data: any, schema: JSONSchema): boolean {

    if (!Array.isArray(schema.enum)) {

      throw new Error(`'enum' must be an array.`);

    }

    /** @todo Move to ES2016 .includes() ? */
    return (schema.enum.indexOf(data) !== -1);

  }

  protected validateType(data: any, schema: JSONSchema): boolean {

    if (Array.isArray(schema.type)) {

      return this.validateTypeList(data, schema);

    }

    if (typeof schema.type !== 'string') {

      throw new Error(`'type' must be a string (arrays of types are not supported yet).`);

    }

    if ((schema.type === 'null') && (data !== null)) {

      return false;

    }

    if (schema.type === 'string') {

      return this.validateString(data, schema);

    }

    if ((schema.type === 'number') || (schema.type === 'integer')) {

      return this.validateNumber(data, schema);

    }

    if ((schema.type === 'boolean') && (typeof data !== 'boolean')) {

      return false;

    }

    if ((schema.type === 'object') && (typeof data !== 'object')) {

      return false;

    }

    return true;

  }


  protected validateTypeList(data: any, schema: JSONSchema): boolean {

    const types = schema.type as JSONSchemaType[];

    const typesTests: boolean[] = [];

    for (let type of types) {

      typesTests.push(this.validateType(data, { type }));

    }

    return (typesTests.indexOf(true) !== -1);

  }

  protected validateItems(data: any[], schema: JSONSchema): boolean {

    if (!Array.isArray(data)) {

      return false;

    }

    if (Array.isArray(schema.items)) {

      return this.validateItemsList(data, schema);

    }

    if (!schema.items || !this.isObjectNotNull(schema.items)) {

      throw new Error(`'items' must be a schema object.`);

    }

    for (let value of data) {

      if (!this.validate(value, schema.items)) {
        return false;
      }

    }

    return true;

  }

  protected validateItemsList(data: any, schema: JSONSchema): boolean {

    const items = schema.items as JSONSchema[];

    if (data.length !== items.length) {

      return false;

    }

    for (let i = 0; i < items.length; i += 1) {

      if (!this.validate(data[i], items[i])) {
        return false;
      }

    }

    return true;

  }

  protected validateString(data: any, schema: JSONSchema): boolean {

    if (typeof data !== 'string') {
      return false;
    }

    if (schema.hasOwnProperty('maxLength')) {

      if ((typeof schema.maxLength !== 'number') || !Number.isInteger(schema.maxLength) || schema.maxLength < 0) {

        throw new Error(`'maxLength' must be a non-negative integer.`);

      }

      if (data.length > schema.maxLength) {
        return false;
      }

    }

    if (schema.hasOwnProperty('minLength')) {

      if ((typeof schema.minLength !== 'number') || !Number.isInteger(schema.minLength) || schema.minLength < 0) {

        throw new Error(`'minLength' must be a non-negative integer.`);

      }

      if (data.length < schema.minLength) {
        return false;
      }

    }

    if (schema.hasOwnProperty('pattern')) {

      if (typeof schema.pattern !== 'string') {

        throw new Error(`'pattern' must be a string with a valid RegExp.`);

      }

      const regularExpression = new RegExp(schema.pattern);

      if (!regularExpression.test(data)) {
        return false;
      }

    }

    return true;

  }

  protected validateNumber(data: any, schema: JSONSchema): boolean {

    if (typeof data !== 'number') {
      return false;
    }

    if ((schema.type === 'integer') && !Number.isInteger(data)) {
      return false;
    }

    if (schema.hasOwnProperty('multipleOf')) {

      if ((typeof schema.multipleOf !== 'number') || schema.multipleOf <= 0) {

        throw new Error(`'multipleOf' must be a number strictly greater than 0.`);

      }

      if (!Number.isInteger(data / schema.multipleOf)) {
        return false;
      }

    }

    if (schema.hasOwnProperty('maximum')) {

      if (typeof schema.maximum !== 'number') {

        throw new Error(`'maximum' must be a number.`);

      }

      if (data > schema.maximum) {
        return false;
      }

    }

    if (schema.hasOwnProperty('exclusiveMaximum')) {

      if (typeof schema.exclusiveMaximum !== 'number') {

        throw new Error(`'exclusiveMaximum' must be a number.`);

      }

      if (data >= schema.exclusiveMaximum) {
        return false;
      }

    }

    if (schema.hasOwnProperty('minimum')) {

      if (typeof schema.minimum !== 'number') {

        throw new Error(`'minimum' must be a number.`);

      }

      if (data < schema.minimum) {
        return false;
      }

    }

    if (schema.hasOwnProperty('exclusiveMinimum')) {

      if (typeof schema.exclusiveMinimum !== 'number') {

        throw new Error(`'exclusiveMinimum' must be a number.`);

      }

      if (data <= schema.exclusiveMinimum) {
        return false;
      }

    }

    return true;

  }

}
