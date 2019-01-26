import { LocalStorage } from './lib.service';
import { IndexedDBDatabase } from './databases/indexeddb-database';
import { JSONValidator } from './validation/json-validator';
import { SCHEMA_STRING, SCHEMA_ARRAY_OF_NUMBERS, SCHEMA_ARRAY_OF_BOOLEANS, SCHEMA_ARRAY_OF_STRINGS } from './validation/constants';
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

  it('should compile with predefined basic schema and without type param', (done: DoneFn) => {

    localStorageService.getItem('test', { schema: SCHEMA_STRING }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('should compile with predefined basic schema and with type param', (done: DoneFn) => {

    localStorageService.getItem<string>('test', { schema: SCHEMA_STRING }).subscribe((_) => {

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

  it('should compile for boolean type', (done: DoneFn) => {

    localStorageService.getItem('test', { schema: { type: 'boolean' } }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('should compile for const string type', (done: DoneFn) => {

    localStorageService.getItem('test', { schema: { const: 'test' } }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('should compile for const number type', (done: DoneFn) => {

    localStorageService.getItem('test', { schema: { const: 5 } }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('should compile for const boolean type', (done: DoneFn) => {

    localStorageService.getItem('test', { schema: { const: false } }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('should compile for enum string type', (done: DoneFn) => {

    localStorageService.getItem('test', { schema: { enum: ['test', 'test 2'] } }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('should compile for enum number type', (done: DoneFn) => {

    localStorageService.getItem('test', { schema: { enum: [1, 2] } }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('should compile for array of strings', (done: DoneFn) => {

    localStorageService.getItem('test', { schema: SCHEMA_ARRAY_OF_STRINGS }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('should compile for array of numbers', (done: DoneFn) => {

    localStorageService.getItem('test', { schema: SCHEMA_ARRAY_OF_NUMBERS }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('should compile for array of booleans', (done: DoneFn) => {

    localStorageService.getItem('test', { schema: SCHEMA_ARRAY_OF_BOOLEANS }).subscribe((_) => {

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

  it('should compile with predefined arrays', (done: DoneFn) => {

    localStorageService.getItem('test', { schema: SCHEMA_ARRAY_OF_BOOLEANS }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('should compile for array of objects', (done: DoneFn) => {

    interface Test {
      test: string;
    }

    localStorageService.getItem<Test[]>('test', { schema: { items: {
      properties: {
        test: { type: 'string' } as JSONSchemaString
      }
    } } }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

  it('should compile for objects without param type', (done: DoneFn) => {

    localStorageService.getItem('test', { schema: {
      properties: {
        test: SCHEMA_STRING
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
      properties: {
        test: SCHEMA_STRING
      }
    } }).subscribe((_) => {

      expect().nothing();

      done();

    });

  });

});
