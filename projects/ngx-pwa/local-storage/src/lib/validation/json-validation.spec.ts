import { JSONValidator } from './json-validator';

describe(`JSONValidator`, () => {

  let jsonValidator: JSONValidator;

  beforeEach(() => {

    jsonValidator = new JSONValidator();

  });

  describe(`using an existing JSON Schema`, () => {

    it(`should not throw with options unsupported by the lib but allowed in the JSON Schema standard`, () => {

      expect(() => {

        jsonValidator.validate({ test: 'test' }, { properties: { test: { type: 'string' } }, additionalProperties: true });

      }).not.toThrow();

    });

  });

  describe(`validate a const`, () => {

    it(`should return true on a string equal to a string const`, () => {

      const test = jsonValidator.validate('test', { const: 'test' });

      expect(test).toBe(true);

    });

    it(`should return false on a string not equal to a string const`, () => {

      const test = jsonValidator.validate('test2', { const: 'test' });

      expect(test).toBe(false);

    });

    it(`should return true on a number equal to a number const`, () => {

      const test = jsonValidator.validate(1.5, { const: 1.5 });

      expect(test).toBe(true);

    });

    it(`should return false on a number not equal to a number const`, () => {

      const test = jsonValidator.validate(2.5, { const: 1.5 });

      expect(test).toBe(false);

    });

    it(`should return true on an integer equal to an integer const`, () => {

      const test = jsonValidator.validate(1, { const: 1 });

      expect(test).toBe(true);

    });

    it(`should return false on an integer not equal to an integer const`, () => {

      const test = jsonValidator.validate(2, { const: 1 });

      expect(test).toBe(false);

    });

    it(`should return true on a boolean equal to a boolean const`, () => {

      const test = jsonValidator.validate(true, { const: true });

      expect(test).toBe(true);

    });

    it(`should return false on a boolean not equal to a boolean const`, () => {

      const test = jsonValidator.validate(false, { const: true });

      expect(test).toBe(false);

    });

    it(`should return true on null equal to a null const`, () => {

      const test = jsonValidator.validate(null, { const: null });

      expect(test).toBe(true);

    });

    it(`should return false on a value not equal to a null const`, () => {

      const test = jsonValidator.validate('test', { const: null });

      expect(test).toBe(false);

    });

    it(`should return false on an empty string with a false const`, () => {

      const test = jsonValidator.validate('', { const: false });

      expect(test).toBe(false);

    });

    it(`should return false on 0 with a false const`, () => {

      const test = jsonValidator.validate(0, { const: false });

      expect(test).toBe(false);

    });

    it(`should return false on an empty string with a null const`, () => {

      const test = jsonValidator.validate('', { const: null });

      expect(test).toBe(false);

    });

    it(`should return false on 0 with a null const`, () => {

      const test = jsonValidator.validate(0, { const: null });

      expect(test).toBe(false);

    });

  });

  describe(`validateEnum`, () => {

    it(`should return true on a value included in an enum`, () => {

      const test = jsonValidator.validate('test', { enum: ['test', 'hello'] });

      expect(test).toBe(true);

    });

    it(`should return false on a value not included in an enum`, () => {

      const test = jsonValidator.validate('test2', { enum: ['test', 'hello'] });

      expect(test).toBe(false);

    });

    it(`should return true on an empty string included in an enum`, () => {

      const test = jsonValidator.validate('', { enum: ['', 'hello'] });

      expect(test).toBe(true);

    });

    it(`should return true on 0 included in an enum`, () => {

      const test = jsonValidator.validate(0, { enum: [0, 1] });

      expect(test).toBe(true);

    });

  });

  describe(`validateType`, () => {

    it(`should return true on a true value with a boolean type`, () => {

      const test = jsonValidator.validate(true, { type: 'boolean' });

      expect(test).toBe(true);

    });

    it(`should return true on a false value with a boolean type`, () => {

      const test = jsonValidator.validate(false, { type: 'boolean' });

      expect(test).toBe(true);

    });

    it(`should return true on a null value with a null type`, () => {

      const test = jsonValidator.validate(null, { type: 'null' });

      expect(test).toBe(true);

    });

    it(`should return false on a primitive value with a mismatched type`, () => {

      const test = jsonValidator.validate('test', { type: 'number' });

      expect(test).toBe(false);

    });

  });

  describe(`validateString`, () => {

    it(`should return true on a string value with string type`, () => {

      const test = jsonValidator.validate('test', { type: 'string' });

      expect(test).toBe(true);

    });

    it(`should throw if maxLength is not an integer`, () => {

      expect(() => {
        jsonValidator.validate('test', { type: 'string', maxLength: 10.5 });
      }).toThrowError();

    });

    it(`should throw if maxLength is negative`, () => {

      expect(() => {
        jsonValidator.validate('test', { type: 'string', maxLength: -1 });
      }).toThrowError();

    });

    it(`should return true with a string respecting maxLength`, () => {

      const test = jsonValidator.validate('test', { type: 'string', maxLength: 10 });

      expect(test).toBe(true);

    });

    it(`should return false with a string not respecting maxLength`, () => {

      const test = jsonValidator.validate('test', { type: 'string', maxLength: 2 });

      expect(test).toBe(false);

    });

    it(`should throw if minLength is not an integer`, () => {

      expect(() => {
        jsonValidator.validate('test', { type: 'string', minLength: 10.5 });
      }).toThrowError();

    });

    it(`should throw if minLength is negative`, () => {

      expect(() => {
        jsonValidator.validate('test', { type: 'string', minLength: -1 });
      }).toThrowError();

    });

    it(`should return true with a string respecting minLength`, () => {

      const test = jsonValidator.validate('test', { type: 'string', minLength: 2 });

      expect(test).toBe(true);

    });

    it(`should return false with a string not respecting minLength`, () => {

      const test = jsonValidator.validate('t', { type: 'string', minLength: 2 });

      expect(test).toBe(false);

    });

    it(`should throw if pattern is not valid`, () => {

      expect(() => {
        jsonValidator.validate('test', { type: 'string', pattern: '+++' });
      }).toThrowError();

    });

    it(`should return true with a string respecting a pattern`, () => {

      const test = jsonValidator.validate('test', { type: 'string', pattern: '^test$' });

      expect(test).toBe(true);

    });

    it(`should return false with a string not respecting a pattern`, () => {

      const test = jsonValidator.validate('t', { type: 'string', pattern: '^test$' });

      expect(test).toBe(false);

    });

  });

  describe(`validateNumber`, () => {

    it(`should return true on an integer value with a number type`, () => {

      const test = jsonValidator.validate(10, { type: 'number' });

      expect(test).toBe(true);

    });

    it(`should return true on a decimal value with a number type`, () => {

      const test = jsonValidator.validate(10.1, { type: 'number' });

      expect(test).toBe(true);

    });

    it(`should return true on an integer value with an integer type`, () => {

      const test = jsonValidator.validate(10, { type: 'integer' });

      expect(test).toBe(true);

    });

    it(`should return false on a decimal value with an integer type`, () => {

      const test = jsonValidator.validate(10.1, { type: 'integer' });

      expect(test).toBe(false);

    });

    it(`should throw if multipleOf is not strictly greater than 0`, () => {

      expect(() => {
        jsonValidator.validate(10, { type: 'number', multipleOf: 0 });
      }).toThrowError();

    });

    it(`should return true with a number is a multiple of x`, () => {

      const test = jsonValidator.validate(5.2, { type: 'number', multipleOf: 2.6 });

      expect(test).toBe(true);

    });

    it(`should return true with an integer is a multiple of x`, () => {

      const test = jsonValidator.validate(10, { type: 'integer', multipleOf: 2 });

      expect(test).toBe(true);

    });

    it(`should return false with a number not a multiple of x`, () => {

      const test = jsonValidator.validate(5.3, { type: 'number', multipleOf: 2.6 });

      expect(test).toBe(false);

    });

    it(`should return false with an integer not a multiple of x`, () => {

      const test = jsonValidator.validate(11, { type: 'integer', multipleOf: 2 });

      expect(test).toBe(false);

    });

    it(`should return true with a number less than a maximum`, () => {

      const test = jsonValidator.validate(5.2, { type: 'number', maximum: 5.7 });

      expect(test).toBe(true);

    });

    it(`should return true with a number equal to maximum`, () => {

      const test = jsonValidator.validate(5.2, { type: 'number', maximum: 5.2 });

      expect(test).toBe(true);

    });

    it(`should return false with a number greater than a maximum`, () => {

      const test = jsonValidator.validate(5.3, { type: 'number', maximum: 5.2 });

      expect(test).toBe(false);

    });

    it(`should return true with an integer less than a maximum`, () => {

      const test = jsonValidator.validate(5, { type: 'integer', maximum: 6 });

      expect(test).toBe(true);

    });

    it(`should return true with an integer equal to maximum`, () => {

      const test = jsonValidator.validate(5, { type: 'integer', maximum: 5 });

      expect(test).toBe(true);

    });

    it(`should return false with an integer greater than a maximum`, () => {

      const test = jsonValidator.validate(6, { type: 'integer', maximum: 5 });

      expect(test).toBe(false);

    });

    it(`should return true with a number less than an exclusiveMaximum`, () => {

      const test = jsonValidator.validate(5.2, { type: 'number', exclusiveMaximum: 5.7 });

      expect(test).toBe(true);

    });

    it(`should return false with a number equal to exclusiveMaximum`, () => {

      const test = jsonValidator.validate(5.2, { type: 'number', exclusiveMaximum: 5.2 });

      expect(test).toBe(false);

    });

    it(`should return false with a number greater than an exclusiveMaximum`, () => {

      const test = jsonValidator.validate(5.3, { type: 'number', exclusiveMaximum: 5.2 });

      expect(test).toBe(false);

    });

    it(`should return true with an integer less than an exclusiveMaximum`, () => {

      const test = jsonValidator.validate(5, { type: 'integer', exclusiveMaximum: 6 });

      expect(test).toBe(true);

    });

    it(`should return false with an integer equal to exclusiveMaximum`, () => {

      const test = jsonValidator.validate(5, { type: 'integer', exclusiveMaximum: 5 });

      expect(test).toBe(false);

    });

    it(`should return false with an integer greater than an exclusiveMaximum`, () => {

      const test = jsonValidator.validate(6, { type: 'integer', exclusiveMaximum: 5 });

      expect(test).toBe(false);

    });

    it(`should return true with a number greater than a minimum`, () => {

      const test = jsonValidator.validate(5.8, { type: 'number', minimum: 5.7 });

      expect(test).toBe(true);

    });

    it(`should return true with a number equal to minimum`, () => {

      const test = jsonValidator.validate(5.2, { type: 'number', minimum: 5.2 });

      expect(test).toBe(true);

    });

    it(`should return false with a number less than an minimum`, () => {

      const test = jsonValidator.validate(5.1, { type: 'number', minimum: 5.2 });

      expect(test).toBe(false);

    });

    it(`should return true with an integer greater than a minimum`, () => {

      const test = jsonValidator.validate(7, { type: 'integer', minimum: 6 });

      expect(test).toBe(true);

    });

    it(`should return true with an integer equal to minimum`, () => {

      const test = jsonValidator.validate(5, { type: 'integer', minimum: 5 });

      expect(test).toBe(true);

    });

    it(`should return false with an integer less than an minimum`, () => {

      const test = jsonValidator.validate(4, { type: 'integer', minimum: 5 });

      expect(test).toBe(false);

    });

    it(`should return true with a number greater than an exclusiveMinimum`, () => {

      const test = jsonValidator.validate(5.8, { type: 'number', exclusiveMinimum: 5.7 });

      expect(test).toBe(true);

    });

    it(`should return false with a number equal to exclusiveMinimum`, () => {

      const test = jsonValidator.validate(5.2, { type: 'number', exclusiveMinimum: 5.2 });

      expect(test).toBe(false);

    });

    it(`should return false with a number less than an exclusiveMinimum`, () => {

      const test = jsonValidator.validate(5.1, { type: 'number', exclusiveMinimum: 5.2 });

      expect(test).toBe(false);

    });

    it(`should return true with an integer greater than an exclusiveMinimum`, () => {

      const test = jsonValidator.validate(7, { type: 'integer', exclusiveMinimum: 6 });

      expect(test).toBe(true);

    });

    it(`should return false with an integer equal to exclusiveMinimum`, () => {

      const test = jsonValidator.validate(5, { type: 'integer', exclusiveMinimum: 5 });

      expect(test).toBe(false);

    });

    it(`should return false with an integer less than an exclusiveMinimum`, () => {

      const test = jsonValidator.validate(4, { type: 'integer', exclusiveMinimum: 5 });

      expect(test).toBe(false);

    });

  });

  describe(`validateRequired`, () => {

    it(`should return false if data is not an object`, () => {

      const test = jsonValidator.validate('', { type: 'object', required: [], properties: {} });

      expect(test).toBe(false);

    });

    it(`should throw if required properties are not described in 'properties'`, () => {

      expect(() => {
        jsonValidator.validate({ test: 'test' }, { type: 'object', properties: { other: { type: 'string' } }, required: ['test'] });
      }).toThrowError();

    });

    it(`should return true on an object with the required properties`, () => {

      const test = jsonValidator.validate({ test1: '', test2: '' }, {
        type: 'object',
        required: ['test1', 'test2'],
        properties: {
          test1: { type: 'string' },
          test2: { type: 'string' }
        }
      });

      expect(test).toBe(true);

    });

    it(`should return true on an object with the required properties and others`, () => {

      const test = jsonValidator.validate({ test1: '', test2: '', test3: '' }, {
        type: 'object',
        required: ['test1', 'test2'],
        properties: {
          test1: { type: 'string' },
          test2: { type: 'string' },
          test3: { type: 'string' }
        }
      });

      expect(test).toBe(true);

    });

    it(`should return true on an object with the required properties and missing optional property`, () => {

      const test = jsonValidator.validate({ test1: '', test2: '' }, {
        type: 'object',
        required: ['test1', 'test2'],
        properties: {
          test1: { type: 'string' },
          test2: { type: 'string' },
          test3: { type: 'string' }
        }
      });

      expect(test).toBe(true);

    });

    it(`should return false on an object with missing required properties`, () => {

      const test = jsonValidator.validate({ test1: '' }, {
        type: 'object',
        required: ['test1', 'test2'],
        properties: {
          test1: { type: 'string' },
          test2: { type: 'string' }
        }
      });

      expect(test).toBe(false);

    });

  });

  describe(`validateProperties`, () => {

    it(`should return false if data is not an object`, () => {

      const test = jsonValidator.validate('', { type: 'object', properties: {} });

      expect(test).toBe(false);

    });

    it(`should return true on an object with valid properties`, () => {

      const test = jsonValidator.validate({ test1: '', test2: 10 }, {
        type: 'object',
        properties: {
          test1: {
            type: 'string'
          },
          test2: {
            type: 'number'
          }
        }
      });

      expect(test).toBe(true);

    });

    it(`should return false on an object with invalid properties`, () => {

      const test = jsonValidator.validate({ test1: 10, test2: 10 }, {
        type: 'object',
        properties: {
          test1: {
            type: 'string'
          },
          test2: {
            type: 'number'
          }
        }
      });

      expect(test).toBe(false);

    });

    it(`should return false on an object with too much properties`, () => {

      const test = jsonValidator.validate({ test1: 10, test2: 10, test3: '' }, {
        type: 'object',
        properties: {
          test1: {
            type: 'string'
          },
          test2: {
            type: 'number'
          }
        }
      });

      expect(test).toBe(false);

    });

    it(`should return true on nested objects with valid properties`, () => {

      const test = jsonValidator.validate({ test1: '', test2: { test3: 10 } }, {
        type: 'object',
        properties: {
          test1: {
            type: 'string'
          },
          test2: {
            properties: {
              test3: {
                type: 'number'
              }
            },
            required: ['test3']
          }
        }
      });

      expect(test).toBe(true);

    });

    it(`should return false on nested objects with invalid properties`, () => {

      const test = jsonValidator.validate({ test1: '', test2: { test3: '' } }, {
        type: 'object',
        properties: {
          test1: {
            type: 'string'
          },
          test2: {
            properties: {
              test3: {
                type: 'number'
              }
            },
            required: ['test3']
          }
        }
      });

      expect(test).toBe(false);

    });

    it(`should return true with valid arrays nested in objects`, () => {

      const test = jsonValidator.validate({ test: ['', ''] }, {
        type: 'object',
        properties: { test: { items: { type: 'string' } } }
      });

      expect(test).toBe(true);

    });

  });

  describe(`validateItems`, () => {

    it(`should return false if data is not an array`, () => {

      const test = jsonValidator.validate('', { type: 'array', items: { type: 'string' } });

      expect(test).toBe(false);

    });

    it(`should return true if array items are valid`, () => {

      const test = jsonValidator.validate(['', ''], { type: 'array', items: { type: 'string' } });

      expect(test).toBe(true);

    });

    it(`should return false if array items are invalid`, () => {

      const test = jsonValidator.validate(['', ''], { type: 'array', items: { type: 'number' } });

      expect(test).toBe(false);

    });

    it(`should return true with valid nested arrays`, () => {

      const test = jsonValidator.validate([[''], ['']], { type: 'array', items: { items: { type: 'string' } } });

      expect(test).toBe(true);

    });

    it(`should return false with invalid nested arrays`, () => {

      const test = jsonValidator.validate([[''], ['']], { type: 'array', items: { items: { type: 'number' } } });

      expect(test).toBe(false);

    });

    it(`should return true with valid objects nested in arrays`, () => {

      const test = jsonValidator.validate([{ test: 'test' }, [{ test: 'test' }]], {
        type: 'array',
        items: { properties: { test: { type: 'string' } } }
      });

      expect(test).toBe(true);

    });

    it(`should throw if maxItems is not an integer`, () => {

      expect(() => {
        jsonValidator.validate([], { type: 'array', items: { type: 'string' }, maxItems: 10.5 });
      }).toThrowError();

    });

    it(`should throw if maxItems is not positive`, () => {

      expect(() => {
        jsonValidator.validate([], { type: 'array', items: { type: 'string' }, maxItems: -1 });
      }).toThrowError();

    });

    it(`should return true with an array with less items than maxItems`, () => {

      const test = jsonValidator.validate([1, 2], { type: 'array', items: { type: 'number' }, maxItems: 3 });

      expect(test).toBe(true);

    });

    it(`should return true with an array length equal to maxItems`, () => {

      const test = jsonValidator.validate([1, 2], { type: 'array', items: { type: 'number' }, maxItems: 2 });

      expect(test).toBe(true);

    });

    it(`should return false with an array with more items than maxItems`, () => {

      const test = jsonValidator.validate([1, 2, 4, 4], { type: 'array', items: { type: 'number' }, maxItems: 3 });

      expect(test).toBe(false);

    });

    it(`should throw if minItems is not an integer`, () => {

      expect(() => {
        jsonValidator.validate([], { type: 'array', items: { type: 'string' }, minItems: 10.5 });
      }).toThrowError();

    });

    it(`should throw if minItems is not positive`, () => {

      expect(() => {
        jsonValidator.validate([], { type: 'array', items: { type: 'string' }, minItems: -1 });
      }).toThrowError();

    });

    it(`should return true with an array with more items than minItems`, () => {

      const test = jsonValidator.validate([1, 2, 3, 4], { type: 'array', items: { type: 'number' }, minItems: 3 });

      expect(test).toBe(true);

    });

    it(`should return true with an array length equal to minItems`, () => {

      const test = jsonValidator.validate([1, 2], { type: 'array', items: { type: 'number' }, minItems: 2 });

      expect(test).toBe(true);

    });

    it(`should return false with an array with less items than maxItems`, () => {

      const test = jsonValidator.validate([1, 2], { type: 'array', items: { type: 'number' }, minItems: 3 });

      expect(test).toBe(false);

    });

    it(`should return true with an array with uniqueItems`, () => {

      const test = jsonValidator.validate([1, 2], { type: 'array', items: { type: 'number' }, uniqueItems: true });

      expect(test).toBe(true);

    });

    it(`should return false with an array with non uniqueItems`, () => {

      const test = jsonValidator.validate([1, 1], { type: 'array', items: { type: 'number' }, uniqueItems: true });

      expect(test).toBe(false);

    });

  });

  describe(`validateItemsList`, () => {

    it(`should return false if array length is not equel to schemas length`, () => {

      const test = jsonValidator.validate(['', 10], { type: 'array', items: [{ type: 'string' }] });

      expect(test).toBe(false);

    });

    it(`should return true if array values match schemas`, () => {

      const test = jsonValidator.validate(['', 10], { type: 'array', items: [{ type: 'string' }, { type: 'number' }] });

      expect(test).toBe(true);

    });

    it(`should return false if array values mismatch schemas`, () => {

      const test = jsonValidator.validate(['', 10], { type: 'array', items: [{ type: 'string' }, { type: 'boolean' }] });

      expect(test).toBe(false);

    });

  });

});
