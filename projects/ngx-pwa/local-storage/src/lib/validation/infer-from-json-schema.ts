import { JSONSchema } from './json-schema';

export type InferFromJsonSchema<Schema extends JSONSchema, DefaultType = unknown> =
  Schema extends { const: infer ConstType } ? ConstType :
  Schema extends { enum: ReadonlyArray<infer EnumType> } ? EnumType :
  Schema extends { type: 'string' } ? string :
  Schema extends { type: 'integer' } ? number :
  Schema extends { type: 'number' } ? number :
  Schema extends { type: 'boolean' } ? boolean :
  // Schema extends { type: 'array', items: infer ItemsType } ?
  //   (ItemsType extends JSONSchema ? InferFromJsonSchema<ItemsType>[] :
  //     (ItemsType extends ReadonlyArray<infer ItemType> ? (ItemType extends JSONSchema ? InferFromJsonSchema<ItemType>[] : unknown) : unknown)
  //   ) :
  Schema extends { type: 'object', properties: infer Properties } ?
    { [Key in keyof Properties]: (Properties[Key] extends JSONSchema ? InferFromJsonSchema<Properties[Key]> : unknown) } :
    DefaultType;
