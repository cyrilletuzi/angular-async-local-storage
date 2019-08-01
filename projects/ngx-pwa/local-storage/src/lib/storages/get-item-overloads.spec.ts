import { map } from 'rxjs/operators';

import { LocalStorage } from './local-storage.service';
import { StorageMap } from './storage-map.service';
import { MemoryDatabase } from '../databases';
import { JSONSchema, JSONSchemaArrayOf, JSONSchemaNumber } from '../validation';

/* For now, `unknown` and `any` cases must be checked manually as any type can be converted to them. */
// TODO: Find a way to automate this: https://github.com/dsherret/conditional-type-checks

describe('getItem() API v8', () => {

  let localStorageService: LocalStorage;

  beforeEach(() => {

    /* Do compilation tests on memory storage to avoid issues when other storages are not available */
    localStorageService = new LocalStorage(new StorageMap(new MemoryDatabase()));

  });

  it('no schema / no cast', (done) => {

    localStorageService.getItem('test').subscribe((_: unknown) => {

      expect().nothing();

      done();

    });

  });

  it('no schema / cast', (done) => {

    localStorageService.getItem<number>('test').subscribe((_: unknown) => {

      expect().nothing();

      done();

    });

  });

  it('literal basic schema / no cast', (done) => {

    localStorageService.getItem('test', { type: 'number' }).subscribe((_: number | null) => {

      expect().nothing();

      done();

    });

  });

  it('literal basic schema / cast', (done) => {

    localStorageService.getItem<number>('test', { type: 'number' }).subscribe((_: number | null) => {

      expect().nothing();

      done();

    });

  });

  it('literal schema with options', (done) => {

    localStorageService.getItem('test', { type: 'number', maximum: 10 }).subscribe((_: number | null) => {

      expect().nothing();

      done();

    });

  });

  it('prepared schema with general interface', (done) => {

    const schema: JSONSchema = { type: 'number' };

    localStorageService.getItem('test', schema).subscribe((_: number | null) => {

      expect().nothing();

      done();

    });

  });

  it('prepared schema with specific interface', (done) => {

    const schema: JSONSchemaNumber = { type: 'number' };

    localStorageService.getItem('test', schema).subscribe((_: number | null) => {

      expect().nothing();

      done();

    });

  });

  it('string', (done) => {

    localStorageService.getItem('test', { type: 'string' }).subscribe((_: string | null) => {

      expect().nothing();

      done();

    });

  });

  it('number', (done) => {

    localStorageService.getItem('test', { type: 'number' }).subscribe((_: number | null) => {

      expect().nothing();

      done();

    });

  });

  it('integer', (done) => {

    localStorageService.getItem('test', { type: 'integer' }).subscribe((_: number | null) => {

      expect().nothing();

      done();

    });

  });

  it('boolean', (done) => {

    localStorageService.getItem('test', { type: 'boolean' }).subscribe((_: boolean | null) => {

      expect().nothing();

      done();

    });

  });

  it('array of strings', (done) => {

    localStorageService.getItem('test', {
      type: 'array',
      items: { type: 'string' }
    }).subscribe((_: string[] | null) => {

      expect().nothing();

      done();

    });

  });

  it('array of numbers', (done) => {

    localStorageService.getItem('test', {
      type: 'array',
      items: { type: 'number' }
    }).subscribe((_: number[] | null) => {

      expect().nothing();

      done();

    });

  });

  it('array of integers', (done) => {

    localStorageService.getItem('test', {
      type: 'array',
      items: { type: 'integer' }
    }).subscribe((_: number[] | null) => {

      expect().nothing();

      done();

    });

  });

  it('array of booleans', (done) => {

    localStorageService.getItem('test', {
      type: 'array',
      items: { type: 'boolean' }
    }).subscribe((_: boolean[] | null) => {

      expect().nothing();

      done();

    });

  });

  it('array with extra options', (done) => {

    const schema: JSONSchemaArrayOf<JSONSchemaNumber> = {
      type: 'array',
      items: { type: 'number' },
      maxItems: 5
    };

    localStorageService.getItem('test', schema).subscribe((_: number[] | null) => {

      expect().nothing();

      done();

    });

  });

  it('array of objects', (done) => {

    interface Test {
      test: string;
    }

    localStorageService.getItem<Test[]>('test', {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          test: { type: 'string' }
        }
      }
    }).subscribe((_: Test[] | null) => {

      expect().nothing();

      done();

    });

  });

  it('objects / cast / no schema', (done) => {

    interface Test {
      test: string;
    }

    localStorageService.getItem<Test>('test').subscribe((_: unknown) => {

      expect().nothing();

      done();

    });

  });

  it('objects / no cast / schema', (done) => {

    localStorageService.getItem('test', {
      type: 'object',
      properties: {
        test: { type: 'string' }
      }
    }).subscribe((_: any) => {

      expect().nothing();

      done();

    });

  });

  it('objects / cast / schema', (done) => {

    interface Test {
      test: string;
    }

    localStorageService.getItem<Test>('test', {
      type: 'object',
      properties: {
        test: { type: 'string' }
      }
    }).subscribe((_: Test | null) => {

      expect().nothing();

      done();

    });

  });

  it('Map', (done) => {

    localStorageService.getItem<[string, number][]>('test', {
      type: 'array',
      items: {
        type: 'array',
        items: [
          { type: 'string' },
          { type: 'number' },
        ],
      },
    }).pipe(
      map((result) => new Map(result))
    ).subscribe((_: Map<string, number>) => {

      expect().nothing();

      done();

    });

  });

  it('Set', (done) => {

    localStorageService.getItem('test', {
      type: 'array',
      items: { type: 'string' },
    }).pipe(
      map((result) => new Set(result))
    ).subscribe((_: Set<string>) => {

      expect().nothing();

      done();

    });

  });

});

describe('getItem() API prior to v8', () => {

  let localStorageService: LocalStorage;

  beforeEach(() => {

    /* Do compilation tests on memory storage to avoid issues when other storages are not available */
    localStorageService = new LocalStorage(new StorageMap(new MemoryDatabase()));

  });

  it('no schema / no cast', (done) => {

    localStorageService.getItem('test').subscribe((_: unknown) => {

      expect().nothing();

      done();

    });

  });

  it('no schema / cast', (done) => {

    localStorageService.getItem<number>('test').subscribe((_: unknown) => {

      expect().nothing();

      done();

    });

  });

  it('literal basic schema / no cast', (done) => {

    localStorageService.getItem('test', { schema: { type: 'number' } }).subscribe((_: any) => {

      expect().nothing();

      done();

    });

  });

  it('literal basic schema / cast', (done) => {

    localStorageService.getItem<number>('test', { schema: { type: 'number' } }).subscribe((_: any) => {

      expect().nothing();

      done();

    });

  });

  it('literal schema with options', (done) => {

    localStorageService.getItem('test', { schema: { type: 'number', maximum: 10 } }).subscribe((_: any) => {

      expect().nothing();

      done();

    });

  });

  it('prepared schema with general interface', (done) => {

    const schema: JSONSchema = { type: 'number' };

    localStorageService.getItem('test', { schema }).subscribe((_: any) => {

      expect().nothing();

      done();

    });

  });

  it('prepared schema with specific interface', (done) => {

    const schema: JSONSchemaNumber = { type: 'number' };

    localStorageService.getItem('test', { schema }).subscribe((_: any) => {

      expect().nothing();

      done();

    });

  });

  it('string', (done) => {

    localStorageService.getItem('test', { schema: { type: 'string' } }).subscribe((_: any) => {

      expect().nothing();

      done();

    });

  });

  it('number', (done) => {

    localStorageService.getItem('test', { schema: { type: 'number' } }).subscribe((_: any) => {

      expect().nothing();

      done();

    });

  });

  it('integer', (done) => {

    localStorageService.getItem('test', { schema: { type: 'integer' } }).subscribe((_: any) => {

      expect().nothing();

      done();

    });

  });

  it('boolean', (done) => {

    localStorageService.getItem('test', { schema: { type: 'boolean' } }).subscribe((_: any) => {

      expect().nothing();

      done();

    });

  });

  it('array of strings', (done) => {

    localStorageService.getItem('test', { schema: {
      type: 'array',
      items: { type: 'string' }
    } }).subscribe((_: any) => {

      expect().nothing();

      done();

    });

  });

  it('array of numbers', (done) => {

    localStorageService.getItem('test', { schema: {
      type: 'array',
      items: { type: 'number' }
    } }).subscribe((_: any) => {

      expect().nothing();

      done();

    });

  });

  it('array of integers', (done) => {

    localStorageService.getItem('test', { schema: {
      type: 'array',
      items: { type: 'integer' }
    } }).subscribe((_: any) => {

      expect().nothing();

      done();

    });

  });

  it('array of booleans', (done) => {

    localStorageService.getItem('test', { schema: {
      type: 'array',
      items: { type: 'boolean' }
    } }).subscribe((_: any) => {

      expect().nothing();

      done();

    });

  });

  it('array with extra options', (done) => {

    const schema: JSONSchemaArrayOf<JSONSchemaNumber> = {
      type: 'array',
      items: { type: 'number' },
      maxItems: 5
    };

    localStorageService.getItem('test', { schema }).subscribe((_: any) => {

      expect().nothing();

      done();

    });

  });

  it('array of objects', (done) => {

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
    } }).subscribe((_: Test[] |  null) => {

      expect().nothing();

      done();

    });

  });

  it('objects / cast / no schema', (done) => {

    interface Test {
      test: string;
    }

    localStorageService.getItem<Test>('test').subscribe((_: unknown) => {

      expect().nothing();

      done();

    });

  });

  it('objects / no cast / schema', (done) => {

    localStorageService.getItem('test', { schema: {
      type: 'object',
      properties: {
        test: { type: 'string' }
      }
    } }).subscribe((_: any) => {

      expect().nothing();

      done();

    });

  });

  it('objects / cast / schema', (done) => {

    interface Test {
      test: string;
    }

    localStorageService.getItem<Test>('test', { schema: {
      type: 'object',
      properties: {
        test: { type: 'string' }
      }
    } }).subscribe((_: Test | null) => {

      expect().nothing();

      done();

    });

  });

});
