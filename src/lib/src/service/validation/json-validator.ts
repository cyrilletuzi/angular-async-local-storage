import { JSONSchema, JSONSchemaType } from './json-schema';

/**
 * @todo Delete console.log in prod environment ?
 * @todo Add other JSON Schema validation features
 */
export class JSONValidator {

  protected readonly simpleTypes = ['string', 'number', 'boolean', 'object'];

  protected isObjectNotNull(value: any) {

    return (value !== null) && (typeof value === 'object');

  }

  protected valueInvalid(error: string) {

    console.log(error);

    return false;

  }

  /**
   * Validate a JSON data against a JSON Schema
   * @param data JSON data to validate
   * @param schema Subset of JSON Schema draft 6
   * @returns If data is valid : true, if it is invalid : false, and throws if the schema is invalid
   */
  validate(data: any, schema: JSONSchema) {

    if (!this.isObjectNotNull(schema)) {

      throw new Error(`A schema must be an object (unlike spec, booleans are not supported to enforce strict types).`);

    }

    if ((!schema.hasOwnProperty('type') || schema.type === 'array' || schema.type === 'object')
    && !schema.hasOwnProperty('properties') && !schema.hasOwnProperty('items')) {

      throw new Error(`Each value must have a 'type' or 'properties' or 'items', to enforce strict types.`);

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

  protected validateProperties(data: {}, schema: JSONSchema) {

    if (!this.isObjectNotNull(data)) {

      return this.valueInvalid(`A value with 'properties' must be an object.`);

    }

    if (!schema.properties || !this.isObjectNotNull(schema.properties)) {

      throw new Error(`'properties' must be a schema object.`);

    }

    /**
     * Check if the object doesn't have more properties than expected
     * Equivalent of additionalProperties: false
     */
    if (Object.keys(schema.properties).length !== Object.keys(data).length) {

      return this.valueInvalid(`Properties set as required should be present in 'properties' too (to enforce strict types).`);

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

  protected validateRequired(data: {}, schema: JSONSchema) {

    if (!this.isObjectNotNull(data)) {

      return this.valueInvalid(`A value with 'required' must be an object.`);

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

        return this.valueInvalid(`Required ${requiredProp} property is missing.`);

      }

    }

    return true;

  }

  protected validateType(data: any, schema: JSONSchema) {

    if (Array.isArray(schema.type)) {

      return this.validateTypeList(data, schema);

    }

    if (typeof schema.type !== 'string') {

      throw new Error(`'type' must be a string (arrays of types are not supported yet).`);

    }

    if ((schema.type === 'null') && (data !== null)) {

      return this.valueInvalid(`Value invalid, should be null`);

    }

    if ((this.simpleTypes.indexOf(schema.type) !== -1) && (typeof data !== schema.type)) {

      return this.valueInvalid(`Value invalid, should be of type ${schema.type}`);

    }

    if ((schema.type === 'integer') && ((typeof data !== 'number') || !Number.isInteger(data))) {

      return this.valueInvalid(`Value invalid, should be an integer`);

    }

    return true;

  }


  protected validateTypeList(data: any, schema: JSONSchema) {

    const types = schema.type as JSONSchemaType[];

    const typesTests: boolean[] = [];

    for (let type of types) {

      typesTests.push(this.validateType(data, { type }));

    }

    return (typesTests.indexOf(true) !== -1);

  }

  protected validateItems(data: any[], schema: JSONSchema) {

    if (!Array.isArray(data)) {

      return this.valueInvalid(`One of the value should be an array.`);

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

  protected validateItemsList(data: any, schema: JSONSchema) {

    const items = schema.items as JSONSchema[];

    if (data.length !== items.length) {

      return this.valueInvalid(`An array does not match the number of items.`);

    }

    for (let i = 0; i < items.length; i += 1) {

      if (!this.validate(data[i], items[i])) {
        return false;
      }

    }

    return true;

  }

}
