import { LocalStorage } from './lib.service';
import { MemoryDatabase } from './databases/memory-database';
import { JSONValidator } from './validation/json-validator';
import { JSONSchemaString, JSONSchema, JSONSchemaArrayOf } from './validation/json-schema';

describe('getItem() overloads compilation', () => {

  let localStorageService: LocalStorage;

  beforeEach(() => {

    /* Do compilation tests on memory storage to avoid issues when other storages are not available */
    localStorageService = new LocalStorage(new MemoryDatabase(), new JSONValidator());

  });

  it('no schema / no cast', (done: DoneFn) => {

    localStorageService.getItem('test').subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('no schema / cast', (done: DoneFn) => {

    localStorageService.getItem<string>('test').subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('literal basic schema / no cast', (done: DoneFn) => {

    localStorageService.getItem('test', { schema: { type: 'string' } }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('literal basic schema / cast', (done: DoneFn) => {

    localStorageService.getItem<string>('test', { schema: { type: 'string' } }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('literal schema with options', (done: DoneFn) => {

    localStorageService.getItem('test', { schema: { type: 'string', maxLength: 10 } }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('prepared schema with general interface', (done: DoneFn) => {

    const schema: JSONSchema = { type: 'string' };

    localStorageService.getItem('test', { schema }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('prepared schema with specific interface', (done: DoneFn) => {

    const schema: JSONSchemaString = { type: 'string' };

    localStorageService.getItem('test', { schema }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('string', (done: DoneFn) => {

    localStorageService.getItem('test', { schema: { type: 'string' } }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('number', (done: DoneFn) => {

    localStorageService.getItem('test', { schema: { type: 'number' } }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('integer', (done: DoneFn) => {

    localStorageService.getItem('test', { schema: { type: 'integer' } }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('boolean', (done: DoneFn) => {

    localStorageService.getItem('test', { schema: { type: 'boolean' } }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('array of strings', (done: DoneFn) => {

    localStorageService.getItem('test', { schema: {
      type: 'array',
      items: { type: 'string' }
    } }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('array of numbers', (done: DoneFn) => {

    localStorageService.getItem('test', { schema: {
      type: 'array',
      items: { type: 'number' }
    } }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('array of integers', (done: DoneFn) => {

    localStorageService.getItem('test', { schema: {
      type: 'array',
      items: { type: 'integer' }
    } }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('array of booleans', (done: DoneFn) => {

    localStorageService.getItem('test', { schema: {
      type: 'array',
      items: { type: 'boolean' }
    } }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('array with extra options', (done: DoneFn) => {

    const schema: JSONSchemaArrayOf<JSONSchemaString> = {
      type: 'array',
      items: { type: 'string' },
      maxItems: 5
    };

    localStorageService.getItem('test', { schema }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('array of objects', (done: DoneFn) => {

    interface Test {
      test: string;
    }

    localStorageService.getItem<Test[]>('test', { schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          test: { type: 'string' }
        }
      }
    } }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('objects / no cast', (done: DoneFn) => {

    localStorageService.getItem('test', { schema: {
      type: 'object',
      properties: {
        test: { type: 'string' }
      }
    } }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('objects / cast', (done: DoneFn) => {

    interface Test {
      test: string;
    }

    localStorageService.getItem<Test>('test', { schema: {
      type: 'object',
      properties: {
        test: { type: 'string' }
      }
    } }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('schema with unsupported options', (done: DoneFn) => {

    // TODO: check this in TS >= 3.3 as it seems weird unknown properties are allowed
    localStorageService.getItem('test', { schema: {
      type: 'object',
      properties: {
        test: { type: 'string' }
      },
      ddd: 'ddd'
    } }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

});
