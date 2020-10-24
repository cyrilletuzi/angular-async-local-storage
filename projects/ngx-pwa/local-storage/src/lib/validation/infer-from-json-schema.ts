import { JSONSchema } from './json-schema';

/**
 * Infer the data type from a tuple JSON schema.
 * Unfortunately, TypeScript doesn't provide yet a dynamic way to handle this,
 * so currently we have a limit of 10 for the tuple length.
 */
export type InferFromJSONSchemaTuple<Schemas extends readonly JSONSchema[]> =
  { -readonly [Key in keyof Schemas]: Schemas[Key] extends JSONSchema ? InferFromJSONSchema<Schemas[Key]> : never }
;

/**
 * Infer the data type from a JSON schema.
 */
export type InferFromJSONSchema<Schema extends JSONSchema> =
  /* Infer `const` and `enum` first, as they are more specific */
  Schema extends { const: infer ConstType } ? ConstType :
  Schema extends { enum: readonly (infer EnumType)[] } ? EnumType :
  /* Infer primitive types */
  Schema extends { type: 'string' } ? string :
  Schema extends { type: 'integer' } ? number :
  Schema extends { type: 'number' } ? number :
  Schema extends { type: 'boolean' } ? boolean :
  /* Infer arrays */
  Schema extends { type: 'array', items: infer ItemsType } ?
    /* Classic array */
    ItemsType extends JSONSchema ? InferFromJSONSchema<ItemsType>[] :
    /* Tuples (ie. array with different value types) */
    ItemsType extends readonly JSONSchema[] ? InferFromJSONSchemaTuple<ItemsType> :
    /* Not supposed to happen given the `JSONSchema` interface */
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
