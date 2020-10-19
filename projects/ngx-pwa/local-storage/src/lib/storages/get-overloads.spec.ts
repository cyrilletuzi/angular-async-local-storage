import { map } from 'rxjs/operators';

import { MemoryDatabase } from '../databases/memory-database';
import { JSONSchema, JSONSchemaArrayOf, JSONSchemaNumber } from '../validation/json-schema';
import { StorageMap } from './storage-map.service';

describe('get() API', () => {

  let storageService: StorageMap;

  beforeEach(() => {

    /* Do compilation tests on memory storage to avoid issues when other storages are not available */
    storageService = new StorageMap(new MemoryDatabase());

  });

  it('no schema / no cast', (done) => {

    // @ts-expect-error
    storageService.get('test').subscribe((_: number) => {

      expect().nothing();

      done();

    });

  });

  it('no schema / cast', (done) => {

    // @ts-expect-error
    // tslint:disable-next-line: deprecation
    storageService.get<number>('test').subscribe((_: number) => {

      expect().nothing();

      done();

    });

  });

  it('schema / wrong cast', (done) => {

    // @ts-expect-error
    // tslint:disable-next-line: deprecation
    storageService.get<number>('test', { type: 'string' }).subscribe((_: number) => {

      expect().nothing();

      done();

    });

  });

  it('literal basic schema / no cast', (done) => {

    storageService.get('test', { type: 'number' }).subscribe((_: number | undefined) => {

      expect().nothing();

      done();

    });

  });

  it('literal basic schema / cast', (done) => {

    storageService.get<number>('test', { type: 'number' }).subscribe((_: number | undefined) => {

      expect().nothing();

      done();

    });

  });

  it('literal schema with options', (done) => {

    storageService.get('test', { type: 'number', maximum: 10 }).subscribe((_: number | undefined) => {

      expect().nothing();

      done();

    });

  });

  it('prepared schema with general interface', (done) => {

    const schema: JSONSchema = { type: 'number' };

    storageService.get('test', schema).subscribe((_: number | undefined) => {

      expect().nothing();

      done();

    });

  });

  it('prepared schema with specific interface', (done) => {

    const schema: JSONSchemaNumber = { type: 'number' };

    storageService.get('test', schema).subscribe((_: number | undefined) => {

      expect().nothing();

      done();

    });

  });

  it('string', (done) => {

    storageService.get('test', { type: 'string' }).subscribe((_: string | undefined) => {

      expect().nothing();

      done();

    });

  });

  it('number', (done) => {

    storageService.get('test', { type: 'number' }).subscribe((_: number | undefined) => {

      expect().nothing();

      done();

    });

  });

  it('integer', (done) => {

    storageService.get('test', { type: 'integer' }).subscribe((_: number | undefined) => {

      expect().nothing();

      done();

    });

  });

  it('boolean', (done) => {

    storageService.get('test', { type: 'boolean' }).subscribe((_: boolean | undefined) => {

      expect().nothing();

      done();

    });

  });

  it('array of strings', (done) => {

    storageService.get('test', {
      type: 'array',
      items: { type: 'string' }
    }).subscribe((_: string[] | undefined) => {

      expect().nothing();

      done();

    });

  });

  it('array of numbers', (done) => {

    storageService.get('test', {
      type: 'array',
      items: { type: 'number' }
    }).subscribe((_: number[] | undefined) => {

      expect().nothing();

      done();

    });

  });

  it('array of integers', (done) => {

    storageService.get('test', {
      type: 'array',
      items: { type: 'integer' }
    }).subscribe((_: number[] | undefined) => {

      expect().nothing();

      done();

    });

  });

  it('array of booleans', (done) => {

    storageService.get('test', {
      type: 'array',
      items: { type: 'boolean' }
    }).subscribe((_: boolean[] | undefined) => {

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

    storageService.get('test', schema).subscribe((_: number[] | undefined) => {

      expect().nothing();

      done();

    });

  });

  it('array of objects', (done) => {

    interface Test {
      test: string;
    }

    storageService.get<Test[]>('test', {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          test: { type: 'string' }
        }
      }
    }).subscribe((_: Test[] | undefined) => {

      expect().nothing();

      done();

    });

  });

  it('objects / cast / no schema', (done) => {

    interface Test {
      test: string;
    }

    // @ts-expect-error
    // tslint:disable-next-line: deprecation
    storageService.get<Test>('test').subscribe((_: Test) => {

      expect().nothing();

      done();

    });

  });

  it('objects / no cast / schema', (done) => {

    storageService.get('test', {
      type: 'object',
      properties: {
        test: { type: 'string' }
      }
    // @ts-expect-error
    }).subscribe((_: string) => {

      expect().nothing();

      done();

    });

  });

  it('objects / cast / schema', (done) => {

    interface Test {
      test: string;
    }

    storageService.get<Test>('test', {
      type: 'object',
      properties: {
        test: { type: 'string' }
      }
    }).subscribe((_: Test | undefined) => {

      expect().nothing();

      done();

    });

  });

  it('Map', (done) => {

    storageService.get<[string, number][]>('test', {
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

    storageService.get('test', {
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
