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

    it(`should return true on a string value with string type`, () => {

      const test = jsonValidator.validate('test', { type: 'string' });

      expect(test).toBe(true);

    });

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

});
