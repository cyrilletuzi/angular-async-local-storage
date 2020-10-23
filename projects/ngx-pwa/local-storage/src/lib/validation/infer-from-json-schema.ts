import { JSONSchema } from './json-schema';

export type InferFromJsonSchemaTuple<Schemas extends readonly JSONSchema[]> =
  Schemas extends readonly [JSONSchema, JSONSchema] ? [InferFromJsonSchema<Schemas[0]>, InferFromJsonSchema<Schemas[1]>] :
  Schemas extends readonly [JSONSchema, JSONSchema, JSONSchema] ? [InferFromJsonSchema<Schemas[0]>, InferFromJsonSchema<Schemas[1]>, InferFromJsonSchema<Schemas[2]>] :
  // tslint:disable-next-line: max-line-length
  Schemas extends readonly [JSONSchema, JSONSchema, JSONSchema, JSONSchema] ? [InferFromJsonSchema<Schemas[0]>, InferFromJsonSchema<Schemas[1]>, InferFromJsonSchema<Schemas[2]>, InferFromJsonSchema<Schemas[3]>] :
  // tslint:disable-next-line: max-line-length
  Schemas extends readonly [JSONSchema, JSONSchema, JSONSchema, JSONSchema, JSONSchema] ? [InferFromJsonSchema<Schemas[0]>, InferFromJsonSchema<Schemas[1]>, InferFromJsonSchema<Schemas[2]>, InferFromJsonSchema<Schemas[3]>, InferFromJsonSchema<Schemas[4]>] :
  // tslint:disable-next-line: max-line-length
  Schemas extends readonly [JSONSchema, JSONSchema, JSONSchema, JSONSchema, JSONSchema, JSONSchema] ? [InferFromJsonSchema<Schemas[0]>, InferFromJsonSchema<Schemas[1]>, InferFromJsonSchema<Schemas[2]>, InferFromJsonSchema<Schemas[3]>, InferFromJsonSchema<Schemas[4]>, InferFromJsonSchema<Schemas[5]>] :
  // tslint:disable-next-line: max-line-length
  Schemas extends readonly [JSONSchema, JSONSchema, JSONSchema, JSONSchema, JSONSchema, JSONSchema, JSONSchema] ? [InferFromJsonSchema<Schemas[0]>, InferFromJsonSchema<Schemas[1]>, InferFromJsonSchema<Schemas[2]>, InferFromJsonSchema<Schemas[3]>, InferFromJsonSchema<Schemas[4]>, InferFromJsonSchema<Schemas[5]>, InferFromJsonSchema<Schemas[6]>] :
  // tslint:disable-next-line: max-line-length
  Schemas extends readonly [JSONSchema, JSONSchema, JSONSchema, JSONSchema, JSONSchema, JSONSchema, JSONSchema, JSONSchema] ? [InferFromJsonSchema<Schemas[0]>, InferFromJsonSchema<Schemas[1]>, InferFromJsonSchema<Schemas[2]>, InferFromJsonSchema<Schemas[3]>, InferFromJsonSchema<Schemas[4]>, InferFromJsonSchema<Schemas[5]>, InferFromJsonSchema<Schemas[6]>, InferFromJsonSchema<Schemas[7]>] :
  // tslint:disable-next-line: max-line-length
  Schemas extends readonly [JSONSchema, JSONSchema, JSONSchema, JSONSchema, JSONSchema, JSONSchema, JSONSchema, JSONSchema, JSONSchema] ? [InferFromJsonSchema<Schemas[0]>, InferFromJsonSchema<Schemas[1]>, InferFromJsonSchema<Schemas[2]>, InferFromJsonSchema<Schemas[3]>, InferFromJsonSchema<Schemas[4]>, InferFromJsonSchema<Schemas[5]>, InferFromJsonSchema<Schemas[6]>, InferFromJsonSchema<Schemas[7]>, InferFromJsonSchema<Schemas[8]>] :
  // tslint:disable-next-line: max-line-length
  Schemas extends readonly [JSONSchema, JSONSchema, JSONSchema, JSONSchema, JSONSchema, JSONSchema, JSONSchema, JSONSchema, JSONSchema, JSONSchema] ? [InferFromJsonSchema<Schemas[0]>, InferFromJsonSchema<Schemas[1]>, InferFromJsonSchema<Schemas[2]>, InferFromJsonSchema<Schemas[3]>, InferFromJsonSchema<Schemas[4]>, InferFromJsonSchema<Schemas[5]>, InferFromJsonSchema<Schemas[6]>, InferFromJsonSchema<Schemas[7]>, InferFromJsonSchema<Schemas[8]>, InferFromJsonSchema<Schemas[9]>] :
  unknown[]
;

export type InferFromJsonSchema<Schema extends JSONSchema, DefaultType = unknown> =
  Schema extends { const: infer ConstType } ? ConstType :
  Schema extends { enum: ReadonlyArray<infer EnumType> } ? EnumType :
  Schema extends { type: 'string' } ? string :
  Schema extends { type: 'integer' } ? number :
  Schema extends { type: 'number' } ? number :
  Schema extends { type: 'boolean' } ? boolean :
  Schema extends { type: 'array', items: infer ItemsType } ?
    ItemsType extends JSONSchema ? InferFromJsonSchema<ItemsType>[] :
      ItemsType extends readonly JSONSchema[] ? InferFromJsonSchemaTuple<ItemsType> : unknown[] :
  Schema extends { type: 'object', properties: infer Properties } ?
    { [Key in keyof Properties]: Properties[Key] extends JSONSchema ? InferFromJsonSchema<Properties[Key]> : unknown } :
    DefaultType;
