import { JSONValidator } from './json-validator';

describe(`JSONValidator`, () => {

  let jsonValidator: JSONValidator;

  beforeEach(() => {

    jsonValidator = new JSONValidator();

  });

  describe(`validation`, () => {

    it(`should throw if schema is not an object`, () => {

      expect(() => {
        jsonValidator.validate('test', 'test' as any);
      }).toThrowError();

    });

    it(`should throw if nothing describes the value`, () => {

      expect(() => {
        jsonValidator.validate('test', {});
      }).toThrowError();

    });

  });

  describe(`validateType`, () => {

    it(`should throw if type is not a string`, () => {

      expect(() => {
        jsonValidator.validate('test', { type: 10 as any });
      }).toThrowError();

    });

    it(`should return true on a true value with a boolean type`, () => {

      const test = jsonValidator.validate(true, { type: 'boolean' });

      expect(test).toBe(true);

    });

    it(`should return true on a false value with a boolean type`, () => {

      const test = jsonValidator.validate(false, { type: 'boolean' });

      expect(test).toBe(true);

    });

    it(`should throw on an object value with an object type without 'properties'`, () => {

      expect(() => {
        jsonValidator.validate({}, { type: 'object' });
      }).toThrow();

    });

    it(`should throw on an array value with an array type without 'items'`, () => {

      expect(() => {
        jsonValidator.validate({}, { type: 'array' });
      }).toThrow();

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

    it(`should throw if maxLength is not a number`, () => {

      expect(() => {
        jsonValidator.validate('test', { type: 'string', maxLength: '10' as any });
      }).toThrowError();

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

    it(`should throw if minLength is not a number`, () => {

      expect(() => {
        jsonValidator.validate('test', { type: 'string', minLength: '10' as any });
      }).toThrowError();

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

    it(`should throw if pattern is not a string`, () => {

      expect(() => {
        jsonValidator.validate('test', { type: 'string', pattern: 1 as any });
      }).toThrowError();

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

    it(`should throw if multipleOf is not a number`, () => {

      expect(() => {
        jsonValidator.validate(10, { type: 'number', multipleOf: '10' as any });
      }).toThrowError();

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

    it(`should throw if maximum is not a number`, () => {

      expect(() => {
        jsonValidator.validate(10, { type: 'number', maximum: '10' as any });
      }).toThrowError();

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

    it(`should throw if exclusiveMaximum is not a number`, () => {

      expect(() => {
        jsonValidator.validate(10, { type: 'number', exclusiveMaximum: '10' as any });
      }).toThrowError();

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

    it(`should throw if minimum is not a number`, () => {

      expect(() => {
        jsonValidator.validate(10, { type: 'number', minimum: '10' as any });
      }).toThrowError();

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

    it(`should throw if exclusiveMinimum is not a number`, () => {

      expect(() => {
        jsonValidator.validate(10, { type: 'number', exclusiveMinimum: '10' as any });
      }).toThrowError();

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

  describe(`validateTypeList`, () => {

    it(`should return true on a valid primitive value with an array type`, () => {

      const test = jsonValidator.validate('test', { type: ['number', 'string'] });

      expect(test).toBe(true);

    });

    it(`should return false on an invalid primitive value with an array type`, () => {

      const test = jsonValidator.validate('test', { type: ['number', 'boolean'] });

      expect(test).toBe(false);

    });

  });

  describe(`validateRequired`, () => {

    it(`should return false if data is not an object`, () => {

      const test = jsonValidator.validate('', { required: [], properties: {} });

      expect(test).toBe(false);

    });

    it(`should throw if required list is not an array`, () => {

      expect(() => {
        jsonValidator.validate({}, { required: 10 as any, properties: {} });
      }).toThrowError();

    });

    it(`should throw if required items are not strings`, () => {

      expect(() => {
        jsonValidator.validate({}, { required: [10] as any, properties: {} });
      }).toThrowError();

    });

    it(`should throw if required properties are not described in 'properties'`, () => {

      expect(() => {
        jsonValidator.validate({ test: 'test' }, { required: ['test'] });
      }).toThrowError();

    });

    it(`should return true on an object with the required properties`, () => {

      const test = jsonValidator.validate({ test1: '', test2: '' }, {
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

      const test = jsonValidator.validate({ test1: '' }, { required: ['test1', 'test2'],
      properties: {
        test1: { type: 'string' },
        test2: { type: 'string' }
      } });

      expect(test).toBe(false);

    });

  });

  describe(`validateProperties`, () => {

    it(`should return false if data is not an object`, () => {

      const test = jsonValidator.validate('', { properties: {} });

      expect(test).toBe(false);

    });

    it(`should throw if properties list is not an object`, () => {

      expect(() => {
        jsonValidator.validate({}, { properties: 10 as any });
      }).toThrowError();

    });

    it(`should return true on an object with valid properties`, () => {

      const test = jsonValidator.validate({ test1: '', test2: 10 }, {
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

      const test = jsonValidator.validate({ test: ['', ''] }, { properties: { test: { items: { type: 'string' } } } });

      expect(test).toBe(true);

    });

  });

  describe(`validateItems`, () => {

    it(`should throw if items is not an object`, () => {

      expect(() => {
        jsonValidator.validate(['test'], { items: 10 as any });
      }).toThrowError();

    });

    it(`should throw if items does not contain type`, () => {

      expect(() => {
        jsonValidator.validate(['test'], { items: {} });
      }).toThrowError();

    });

    it(`should return false if data is not an array`, () => {

      const test = jsonValidator.validate('', { items: { type: 'string' } });

      expect(test).toBe(false);

    });

    it(`should return true if array items are valid`, () => {

      const test = jsonValidator.validate(['', ''], { items: { type: 'string' } });

      expect(test).toBe(true);

    });

    it(`should return false if array items are invalid`, () => {

      const test = jsonValidator.validate(['', ''], { items: { type: 'number' } });

      expect(test).toBe(false);

    });

    it(`should return true with valid nested arrays`, () => {

      const test = jsonValidator.validate([[''], ['']], { items: { items: { type: 'string' } } });

      expect(test).toBe(true);

    });

    it(`should return false with invalid nested arrays`, () => {

      const test = jsonValidator.validate([[''], ['']], { items: { items: { type: 'number' } } });

      expect(test).toBe(false);

    });

    it(`should return true with valid objects nested in arrays`, () => {

      const test = jsonValidator.validate([{ test: 'test' }, [{ test: 'test' }]], { items: { properties: { test: { type: 'string' } } } });

      expect(test).toBe(true);

    });

  });

  describe(`validateItemsList`, () => {

    it(`should return false if array length is not equel to schemas length`, () => {

      const test = jsonValidator.validate(['', 10], { items: [{ type: 'string' }] });

      expect(test).toBe(false);

    });

    it(`should return true if array values match schemas`, () => {

      const test = jsonValidator.validate(['', 10], { items: [{ type: 'string' }, { type: 'number' }] });

      expect(test).toBe(true);

    });

    it(`should return false if array values mismatch schemas`, () => {

      const test = jsonValidator.validate(['', 10], { items: [{ type: 'string' }, { type: 'boolean' }] });

      expect(test).toBe(false);

    });

  });

});
