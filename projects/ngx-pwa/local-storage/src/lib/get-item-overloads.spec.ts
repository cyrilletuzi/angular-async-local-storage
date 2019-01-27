import { LocalStorage } from './lib.service';
import { IndexedDBDatabase } from './databases/indexeddb-database';
import { JSONValidator } from './validation/json-validator';
import { JSONSchemaString, JSONSchema, JSONSchemaArrayOf } from './validation/json-schema';

describe('getItem() overload signature', () => {

  let localStorageService: LocalStorage;

  beforeEach((done: DoneFn) => {

    localStorageService = new LocalStorage(new IndexedDBDatabase(), new JSONValidator());

    localStorageService.clear().subscribe(() => {

      done();

    });

  });

  it('should compile with no schema and without cast', (done: DoneFn) => {

    localStorageService.getItem('test').subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('should compile with no schema and with cast', (done: DoneFn) => {

    localStorageService.getItem<string>('test').subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('should compile with literal basic schema and without type param', (done: DoneFn) => {

    localStorageService.getItem('test', { schema: { type: 'string' } }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('should compile with literal basic schema and with type param', (done: DoneFn) => {

    localStorageService.getItem<string>('test', { schema: { type: 'string' } }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('should compile with literal basic schema and extra options', (done: DoneFn) => {

    localStorageService.getItem<string>('test', { schema: { type: 'string', maxLength: 10 } }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('should compile with prepared basic schema and with specific interface', (done: DoneFn) => {

    const schema: JSONSchemaString = { type: 'string' };

    localStorageService.getItem('test', { schema }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('should compile with prepared basic schema and with generic interface', (done: DoneFn) => {

    const schema: JSONSchema = { type: 'string' };

    localStorageService.getItem('test', { schema }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('should compile for string type', (done: DoneFn) => {

    localStorageService.getItem('test', { schema: { type: 'string' } }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('should compile for number type', (done: DoneFn) => {

    localStorageService.getItem('test', { schema: { type: 'number' } }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('should compile for integer type', (done: DoneFn) => {

    localStorageService.getItem('test', { schema: { type: 'integer' } }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('should compile for boolean type', (done: DoneFn) => {

    localStorageService.getItem('test', { schema: { type: 'boolean' } }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('should compile for array of strings', (done: DoneFn) => {

    localStorageService.getItem('test', { schema: {
      type: 'array',
      items: { type: 'string' }
    } }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('should compile for array of numbers', (done: DoneFn) => {

    localStorageService.getItem('test', { schema: {
      type: 'array',
      items: { type: 'number' }
    } }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('should compile for array of integers', (done: DoneFn) => {

    localStorageService.getItem('test', { schema: {
      type: 'array',
      items: { type: 'integer' }
    } }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('should compile for array of booleans', (done: DoneFn) => {

    localStorageService.getItem('test', { schema: {
      type: 'array',
      items: { type: 'boolean' }
    } }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('should compile for array with extra options', (done: DoneFn) => {

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

  it('should compile for array of objects', (done: DoneFn) => {

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

  it('should compile for objects without param type', (done: DoneFn) => {

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

  it('should compile for objects with param type', (done: DoneFn) => {

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

});
