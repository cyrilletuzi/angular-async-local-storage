import { JSONSchema } from './json-schema';

/**
 * JSON schemas of primitive types
 */
type JSONSchemaPrimitive = { type: 'string' | 'integer' | 'number' | 'boolean' };

/**
 * Infer data from a JSON schemas describing a primitive type.
 */
type InferFromJSONSchemaPrimitive<Schema extends JSONSchemaPrimitive> =
  /* Infer `const` and `enum` first, as they are more specific */
  Schema extends { const: infer ConstType } ? ConstType :
  Schema extends { enum: readonly (infer EnumType)[] } ? EnumType :
  /* Infer primitive types */
  Schema extends { type: 'string' } ? string :
  Schema extends { type: 'integer' } ? number :
  Schema extends { type: 'number' } ? number :
  Schema extends { type: 'boolean' } ? boolean :
  /* Default value, but not supposed to happen given the `JSONSchema` interface */
  unknown;

/**
 * Infer the data type from a tuple JSON schema describing a tuple of primitive types.
 */
type InferFromJSONSchemaTupleOfPrimitive<Schemas extends readonly JSONSchemaPrimitive[]> = {
  -readonly [Key in keyof Schemas]: Schemas[Key] extends JSONSchemaPrimitive ? InferFromJSONSchemaPrimitive<Schemas[Key]> : never
};

/**
 * Infer the data type from a JSON schema describing a tuple:
 * - with 1 or 2 values of any type (especially usefull for handling `Map`s),
 * - with unlimited values but of primitive types only.
 */
type InferFromJSONSchemaTuple<Schemas extends readonly JSONSchema[]> =
  /* Allows inference from any JSON schema up to 2 values */
  Schemas extends readonly [JSONSchema] ? [InferFromJSONSchema<Schemas[0]>] :
  Schemas extends readonly [JSONSchema, JSONSchema] ? [InferFromJSONSchema<Schemas[0]>, InferFromJSONSchema<Schemas[1]>] :
  /* Beyond 2 values, infer from primitive types only to avoid too deep type inference */
  Schemas extends readonly JSONSchemaPrimitive[] ? InferFromJSONSchemaTupleOfPrimitive<Schemas> :
  unknown[]
;

/**
 * Infer the data type from a JSON schema.
 */
export type InferFromJSONSchema<Schema extends JSONSchema> =
  /* Infer primitive types */
  Schema extends JSONSchemaPrimitive ? InferFromJSONSchemaPrimitive<Schema> :
  /* Infer arrays */
  Schema extends { type: 'array', items: infer ItemsType } ?
    /* Classic array */
    ItemsType extends JSONSchema ? InferFromJSONSchema<ItemsType>[] :
    /* Tuples (ie. array with different value types) */
    ItemsType extends readonly JSONSchema[] ? InferFromJSONSchemaTuple<ItemsType> :
    /* Default value, but not supposed to happen given the `JSONSchema` interface */
    unknown[] :
  /* Infer objects */
  Schema extends { type: 'object', properties: infer Properties, required?: readonly (infer RequiredProperties)[] } ?
    {
      -readonly [Key in keyof Pick<Properties, RequiredProperties extends keyof Properties ? RequiredProperties : never>]:
      Properties[Key] extends JSONSchema ? InferFromJSONSchema<Properties[Key]> : never;
    } & {
      -readonly [Key in keyof Omit<Properties, RequiredProperties extends keyof Properties ? RequiredProperties : never>]?:
      Properties[Key] extends JSONSchema ? InferFromJSONSchema<Properties[Key]> : never;
    } :
  /* Default type if inference failed */
  unknown;
