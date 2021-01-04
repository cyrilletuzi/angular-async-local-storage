import { JSONValidator } from './json-validator';

describe(`JSONValidator`, () => {

  let jsonValidator: JSONValidator;

  beforeEach(() => {

    jsonValidator = new JSONValidator();

  });

  describe(`JSON Schema standard`, () => {

    it(`should not throw with options unsupported by the lib but allowed in the standard`, () => {

      expect(() => {

        const schema = {
          type: 'object',
          properties: { test: { type: 'string' } },
          additionalProperties: true,
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jsonValidator.validate({ test: 'test' }, schema as any);

      }).not.toThrow();

    });

  });

  describe(`string`, () => {

    describe(`type`, () => {

      it('valid', () => {

        const test = jsonValidator.validate('test', { type: 'string' });

        expect(test).toBe(true);

      });

      it('invalid', () => {

        const test = jsonValidator.validate(5, { type: 'string' });

        expect(test).toBe(false);

      });

    });

    describe(`const`, () => {

      it('valid', () => {

        const test = jsonValidator.validate('test', { type: 'string', const: 'test' });

        expect(test).toBe(true);

      });

      it('invalid', () => {

        const test = jsonValidator.validate('test2', { type: 'string', const: 'test' });

        expect(test).toBe(false);

      });

    });

    describe(`enum`, () => {

      it('valid', () => {

      const test = jsonValidator.validate('test', { type: 'string', enum: ['test', 'hello'] });

      expect(test).toBe(true);

      });

      it('invalid', () => {

        const test = jsonValidator.validate('test2', { type: 'string', enum: ['test', 'hello'] });

        expect(test).toBe(false);

      });

      it('special case: empty string', () => {

        const test = jsonValidator.validate('', { type: 'string', enum: ['', 'hello'] });

        expect(test).toBe(true);

      });

      it('special case: readonly', () => {

        const schema = { type: 'string', enum: ['', 'hello'] } as const;

        const test = jsonValidator.validate('', schema);

        expect(test).toBe(true);

      });

    });

    describe(`maxLength`, () => {

      it('valid', () => {

        const test = jsonValidator.validate('test', { type: 'string', maxLength: 10 });

        expect(test).toBe(true);

      });

      it('invalid', () => {

        const test = jsonValidator.validate('test', { type: 'string', maxLength: 2 });

        expect(test).toBe(false);

      });

      it('special case: exact length', () => {

        const test = jsonValidator.validate('test', { type: 'string', maxLength: 4 });

        expect(test).toBe(true);

      });

    });

    describe(`minLength`, () => {

      it('valid', () => {

        const test = jsonValidator.validate('test', { type: 'string', minLength: 2 });

        expect(test).toBe(true);

      });

      it('invalid', () => {

        const test = jsonValidator.validate('t', { type: 'string', minLength: 2 });

        expect(test).toBe(false);

      });

      it('special case: exact length', () => {

        const test = jsonValidator.validate('test', { type: 'string', minLength: 4 });

        expect(test).toBe(true);

      });

    });

    describe(`pattern`, () => {

      it('valid', () => {

        const test = jsonValidator.validate('test', { type: 'string', pattern: '^test$' });

        expect(test).toBe(true);

      });

      it('invalid', () => {

        const test = jsonValidator.validate('t', { type: 'string', pattern: '^test$' });

        expect(test).toBe(false);

      });

      it('special case: malformed RegExp', () => {

        expect(() => {

          const test = jsonValidator.validate('test', { type: 'string', pattern: '+++' });
          expect(test).toBe(true);

        }).not.toThrowError();

      });

    });

  });

  describe(`number`, () => {

    describe(`type`, () => {

      it('valid number', () => {

        const test = jsonValidator.validate(10, { type: 'number' });

        expect(test).toBe(true);

      });

      it('valid integer', () => {

        const test = jsonValidator.validate(10.1, { type: 'number' });

        expect(test).toBe(true);

      });

      it('invalid', () => {

        const test = jsonValidator.validate('test', { type: 'number' });

        expect(test).toBe(false);

      });

    });

    describe(`integer`, () => {

      it('valid', () => {

        const test = jsonValidator.validate(10, { type: 'integer' });

        expect(test).toBe(true);

      });

      it('invalid', () => {

        const test = jsonValidator.validate(10.1, { type: 'integer' });

        expect(test).toBe(false);

      });

    });

    describe(`const`, () => {

      it('valid', () => {

        const test = jsonValidator.validate(1.5, { type: 'number', const: 1.5 });

        expect(test).toBe(true);

      });

      it('invalid', () => {

        const test = jsonValidator.validate(2.5, { type: 'number', const: 1.5 });

        expect(test).toBe(false);

      });

      it('special case: 0', () => {

        const test = jsonValidator.validate(0, { type: 'number', const: 0 });

        expect(test).toBe(true);

      });

    });

    describe(`enum`, () => {

      it('valid', () => {

        const test = jsonValidator.validate(1, { type: 'number', enum: [1, 2] });

        expect(test).toBe(true);

      });

      it('invalid', () => {

        const test = jsonValidator.validate(5, { type: 'number', enum: [0, 1] });

        expect(test).toBe(false);

      });

      it('special case: 0', () => {

        const test = jsonValidator.validate(0, { type: 'number', enum: [0, 1] });

        expect(test).toBe(true);

      });

    });

    describe(`multipleOf`, () => {

      it('valid', () => {

        const test = jsonValidator.validate(5.2, { type: 'number', multipleOf: 2.6 });

        expect(test).toBe(true);

      });

      it('invalid', () => {

        const test = jsonValidator.validate(5.3, { type: 'number', multipleOf: 2.6 });

        expect(test).toBe(false);

      });

      it('special case: 0', () => {

        expect(() => {

          const test = jsonValidator.validate(5.2, { type: 'number', multipleOf: 0 });

          expect(test).toBe(true);

        }).not.toThrowError();

      });

    });


    describe(`maximum`, () => {

      it('valid', () => {

        const test = jsonValidator.validate(5.2, { type: 'number', maximum: 5.7 });

        expect(test).toBe(true);

      });

      it('invalid', () => {

        const test = jsonValidator.validate(5.3, { type: 'number', maximum: 5.2 });

        expect(test).toBe(false);

      });

      it('special case: equality', () => {

        const test = jsonValidator.validate(5.2, { type: 'number', maximum: 5.2 });

        expect(test).toBe(true);

      });

    });

    describe(`exclusiveMaximum`, () => {

      it('valid', () => {

        const test = jsonValidator.validate(5.2, { type: 'number', exclusiveMaximum: 5.7 });

        expect(test).toBe(true);

      });

      it('invalid', () => {

        const test = jsonValidator.validate(5.3, { type: 'number', exclusiveMaximum: 5.2 });

        expect(test).toBe(false);

      });

      it('special case: equality', () => {

        const test = jsonValidator.validate(5.2, { type: 'number', exclusiveMaximum: 5.2 });

        expect(test).toBe(false);

      });

    });

    describe('minimum', () => {

      it(`valid`, () => {

        const test = jsonValidator.validate(5.8, { type: 'number', minimum: 5.7 });

        expect(test).toBe(true);

      });

      it(`invalid`, () => {

        const test = jsonValidator.validate(5.1, { type: 'number', minimum: 5.2 });

        expect(test).toBe(false);

      });

      it(`special case: equality`, () => {

        const test = jsonValidator.validate(5.2, { type: 'number', minimum: 5.2 });

        expect(test).toBe(true);

      });

    });

    describe('exclusiveMinimum', () => {

      it(`valid`, () => {

        const test = jsonValidator.validate(5.8, { type: 'number', exclusiveMinimum: 5.7 });

        expect(test).toBe(true);

      });

      it(`invalid`, () => {

        const test = jsonValidator.validate(5.1, { type: 'number', exclusiveMinimum: 5.2 });

        expect(test).toBe(false);

      });

      it(`special case: equality`, () => {

        const test = jsonValidator.validate(5.2, { type: 'number', exclusiveMinimum: 5.2 });

        expect(test).toBe(false);

      });

    });

  });

  describe('boolean', () => {

    describe('type', ()  => {

      it(`valid`, () => {

        const test = jsonValidator.validate(false, { type: 'boolean' });

        expect(test).toBe(true);

      });

      it(`invalid`, () => {

        const test = jsonValidator.validate('test', { type: 'boolean' });

        expect(test).toBe(false);

      });

    });

    describe('const', () => {

      it(`valid`, () => {

        const test = jsonValidator.validate(true, { type: 'boolean', const: true });

        expect(test).toBe(true);

      });

      it(`invalid`, () => {

        const test = jsonValidator.validate(false, { type: 'boolean', const: true });

        expect(test).toBe(false);

      });

    });

  });

  describe(`array`, () => {

    describe('type', ()  => {

      it(`valid`, () => {

        const test = jsonValidator.validate([], { type: 'array', items: { type: 'string' } });

        expect(test).toBe(true);

      });

      it(`invalid`, () => {

        const test = jsonValidator.validate('', { type: 'array', items: { type: 'string' } });

        expect(test).toBe(false);

      });

    });

    describe('items', ()  => {

      it(`valid`, () => {

        const test = jsonValidator.validate(['', ''], { type: 'array', items: { type: 'string' } });

        expect(test).toBe(true);

      });

      it(`invalid`, () => {

        const test = jsonValidator.validate(['', ''], { type: 'array', items: { type: 'number' } });

        expect(test).toBe(false);

      });

      it(`special case: mixed types`, () => {

        const test = jsonValidator.validate([1, 'test'], { type: 'array', items: { type: 'number' } });

        expect(test).toBe(false);

      });

    });

    describe('tuple', ()  => {

      it(`valid`, () => {

        const test = jsonValidator.validate(['test1', 1], { type: 'array', items: [{ type: 'string' }, { type: 'number' }] });

        expect(test).toBe(true);

      });

      it(`invalid`, () => {

        const test = jsonValidator.validate(['test1', 'test'], { type: 'array', items: [{ type: 'string' }, { type: 'number' }] });

        expect(test).toBe(false);

      });

      it(`special case: greater length`, () => {

        const test = jsonValidator.validate(['test1', 1, 2], { type: 'array', items: [{ type: 'string' }, { type: 'number' }] });

        expect(test).toBe(false);

      });

      it(`special case: lower length`, () => {

        const test = jsonValidator.validate(['test1'], { type: 'array', items: [{ type: 'string' }, { type: 'number' }] });

        expect(test).toBe(false);

      });

    });

    describe('arrays items', ()  => {

      it(`valid`, () => {

        const test = jsonValidator.validate([[''], ['']], {
          type: 'array',
          items: {
            type: 'array',
            items: { type: 'string' }
          }
        });

        expect(test).toBe(true);

      });

      it(`invalid`, () => {

        const test = jsonValidator.validate([[''], ['']], {
          type: 'array',
          items: {
            type: 'array',
            items: { type: 'number' }
          }
        });

        expect(test).toBe(false);

      });

    });

    describe('objects items', () => {

      it(`valid`, () => {

        const test = jsonValidator.validate([{ test: 'test' }, [{ test: 'test' }]], {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              test: { type: 'string' }
            }
          }
        });

        expect(test).toBe(true);

      });

      it(`invalid`, () => {

        const test = jsonValidator.validate([{ test: 5 }, [{ test: 5 }]], {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              test: { type: 'string' }
            }
          }
        });

        expect(test).toBe(false);

      });

    });

    describe('maxItems', () => {

      it(`valid`, () => {

        const test = jsonValidator.validate([1, 2], { type: 'array', items: { type: 'number' }, maxItems: 3 });

        expect(test).toBe(true);

      });

      it(`invalid`, () => {

        const test = jsonValidator.validate([1, 2, 4, 4], { type: 'array', items: { type: 'number' }, maxItems: 3 });

        expect(test).toBe(false);

      });

      it(`special case: exact length`, () => {

        const test = jsonValidator.validate([1, 2], { type: 'array', items: { type: 'number' }, maxItems: 2 });

        expect(test).toBe(true);

      });

    });

    describe('maxItems', () => {

      it(`valid`, () => {

        const test = jsonValidator.validate([1, 2, 3, 4], { type: 'array', items: { type: 'number' }, minItems: 3 });

        expect(test).toBe(true);

      });

      it(`invalid`, () => {

        const test = jsonValidator.validate([1, 2], { type: 'array', items: { type: 'number' }, minItems: 3 });

        expect(test).toBe(false);

      });

      it(`special case: exact length`, () => {

        const test = jsonValidator.validate([1, 2], { type: 'array', items: { type: 'number' }, minItems: 2 });

        expect(test).toBe(true);

      });

    });

    describe('uniqueItems', () => {

      it(`valid`, () => {

        const test = jsonValidator.validate([1, 2], { type: 'array', items: { type: 'number' }, uniqueItems: true });

        expect(test).toBe(true);

      });

      it(`invalid`, () => {

        const test = jsonValidator.validate([1, 1], { type: 'array', items: { type: 'number' }, uniqueItems: true });

        expect(test).toBe(false);

      });

    });

  });

  describe(`object`, () => {

    describe('type', () => {

      it(`valid`, () => {

        const test = jsonValidator.validate({}, { type: 'object', properties: {} });

        expect(test).toBe(true);

      });

      it(`invalid`, () => {

        const test = jsonValidator.validate('', { type: 'object', properties: {} });

        expect(test).toBe(false);

      });

    });

    describe(`required`, () => {

      it(`valid`, () => {

        const test = jsonValidator.validate({ test1: '', test2: '' }, {
          type: 'object',
          required: ['test1', 'test2'],
          properties: {
            test1: { type: 'string' },
            test2: { type: 'string' },
          }
        });

        expect(test).toBe(true);

      });

      it(`invalid`, () => {

        const test = jsonValidator.validate({ test1: '' }, {
          type: 'object',
          required: ['test1', 'test2'],
          properties: {
            test1: { type: 'string' },
            test2: { type: 'string' },
          }
        });

        expect(test).toBe(false);

      });

      it(`special case: some optional properties`, () => {

        const test = jsonValidator.validate({ test1: '', test2: '' }, {
          type: 'object',
          required: ['test1', 'test2'],
          properties: {
            test1: { type: 'string' },
            test2: { type: 'string' },
            test3: { type: 'string' },
          }
        });

        expect(test).toBe(true);

      });

    });

    describe('properties', () => {

      it(`valid`, () => {

        const test = jsonValidator.validate({ test1: '', test2: 10 }, {
          type: 'object',
          properties: {
            test1: { type: 'string' },
            test2: { type: 'number' },
          }
        });

        expect(test).toBe(true);

      });

      it(`invalid`, () => {

        const test = jsonValidator.validate({ test1: 10, test2: 10 }, {
          type: 'object',
          properties: {
            test1: { type: 'string' },
            test2: { type: 'number' },
          }
        });

        expect(test).toBe(false);

      });

      it(`special case: extra properties`, () => {

        const test = jsonValidator.validate({ test1: 10, test2: 10, test3: '' }, {
          type: 'object',
          properties: {
            test1: { type: 'number' },
            test2: { type: 'number' },
          }
        });

        expect(test).toBe(false);

      });

    });

    describe('objects properties', () => {

      it(`valid`, () => {

        const test = jsonValidator.validate({ test1: '', test2: { test3: 10 } }, {
          type: 'object',
          properties: {
            test1: { type: 'string' },
            test2: {
              type: 'object',
              properties: {
                test3: { type: 'number' },
              },
              required: ['test3']
            },
          }
        });

        expect(test).toBe(true);

      });

      it(`invalid`, () => {

        const test = jsonValidator.validate({ test1: '', test2: { test3: '' } }, {
          type: 'object',
          properties: {
            test1: { type: 'string' },
            test2: {
              type: 'object',
              properties: {
                test3: { type: 'number' },
              },
              required: ['test3']
            },
          }
        });

        expect(test).toBe(false);

      });

    });

    describe('arrays properties', () => {

      it(`valid`, () => {

        const test = jsonValidator.validate({ test: ['', ''] }, {
          type: 'object',
          properties: {
            test: {
              type: 'array',
              items: { type: 'string' }
            }
          },
        });

        expect(test).toBe(true);

      });

      it(`invalid`, () => {

        const test = jsonValidator.validate({ test: [1, 2] }, {
          type: 'object',
          properties: {
            test: {
              type: 'array',
              items: { type: 'string' }
            }
          },
        });

        expect(test).toBe(false);

      });

    });

  });

});
