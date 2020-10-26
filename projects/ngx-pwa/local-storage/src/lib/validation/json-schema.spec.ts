import { JSONSchema } from './json-schema';

describe('JSONSchema', () => {

  function test(schema: JSONSchema): void {
    if (schema) {}
    expect().nothing();
  }

  describe('classic', () => {

    it('string', () => {

      const schema: JSONSchema = {
        type: 'string',
        const: 'hello',
        enum: ['hello', 'world'],
        maxLength: 10,
        minLength: 1,
        pattern: '[a-Z]+',
      };

      test(schema);

    });

    it('number', () => {

      const schema: JSONSchema = {
        type: 'number',
        const: 1.5,
        enum: [1.5, 2.4],
        exclusiveMaximum: 10.4,
        maximum: 9.6,
        exclusiveMinimum: 2.3,
        minimum: 3.1,
        multipleOf: 2.1,
      };

      test(schema);

    });

    it('integer', () => {

      const schema: JSONSchema = {
        type: 'integer',
        const: 1,
        enum: [1, 2],
        exclusiveMaximum: 10,
        maximum: 9,
        exclusiveMinimum: 2,
        minimum: 3,
        multipleOf: 2,
      };

      test(schema);

    });

    it('boolean', () => {

      const schema: JSONSchema = {
        type: 'boolean',
        const: true,
      };

      test(schema);

    });

    it('array', () => {

      const schema: JSONSchema = {
        type: 'array',
        items: { type: 'string' },
        maxItems: 10,
        minItems: 1,
        uniqueItems: true,
      };

      test(schema);

    });

    it('tuple', () => {

      const schema: JSONSchema = {
        type: 'array',
        items: [
          { type: 'string' },
          { type: 'number' },
        ],
        maxItems: 2,
        minItems: 2,
        uniqueItems: true,
      };

      test(schema);

    });

    it('object', () => {

      const schema: JSONSchema = {
        type: 'object',
        properties: {
          hello: { type: 'string' },
          world: { type: 'number' },
        },
        required: ['hello'],
      };

      test(schema);

    });

  });

  describe('readonly support', () => {

    it('string enum', () => {

      const schema = {
        type: 'string',
        enum: ['hello', 'world'],
      } as const;

      test(schema);

    });

    it('number enum', () => {

      const schema = {
        type: 'number',
        enum: [1.4, 2.6],
      } as const;

      test(schema);

    });

    it('integer enum', () => {

      const schema = {
        type: 'integer',
        enum: [1, 2],
      } as const;

      test(schema);

    });

    it('tuple', () => {

      const schema = {
        type: 'array',
        items: [
          { type: 'string' },
          { type: 'number' },
        ],
      } as const;

      test(schema);

    });

    it('object with required', () => {

      const schema = {
        type: 'object',
        properties: {
          hello: { type: 'string' },
          world: { type: 'number' },
        },
        required: ['hello'],
      } as const;

      test(schema);

    });

  });

  describe('specials', () => {

    it('unexisting option', () => {

      const schema: JSONSchema = {
        type: 'string',
        // @ts-expect-error
        required: ['hello'],
      };

      test(schema);

    });

    it('option with wrong type', () => {

      const schema: JSONSchema = {
        type: 'string',
        // @ts-expect-error
        maxLength: '1',
      };

      test(schema);

    });

    it('option with wrong type', () => {

      const schema: JSONSchema = {
        type: 'string',
        // @ts-expect-error
        maxLength: '1',
      };

      test(schema);

    });

  });

});
