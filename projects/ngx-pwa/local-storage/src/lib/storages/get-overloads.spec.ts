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

    // tslint:disable-next-line: deprecation
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

  it('special string', (done) => {

    type Theme = 'dark' | 'light';

    // tslint:disable-next-line: deprecation
    storageService.get<Theme>('test', { type: 'string' }).subscribe((_: Theme | undefined) => {

      expect().nothing();

      done();

    });

  });

  it('string with const', (done) => {

    storageService.get('test', { type: 'string', const: 'hello' } as const).subscribe((_: 'hello' | undefined) => {

      expect().nothing();

      done();

    });

  });

  it('string with enum', (done) => {

    storageService.get('test', { type: 'string', enum: ['hello', 'world'] } as const).subscribe((_: 'hello' | 'world' | undefined) => {

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

  it('special number', (done) => {

    type SomeNumbers = 1.5 | 2.5;

    storageService.get('test', { type: 'number', enum: [1.5, 2.5] } as const).subscribe((_: SomeNumbers | undefined) => {

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

  it('special integer', (done) => {

    type SpecialIntegers = 1 | 2;

    storageService.get('test', { type: 'integer', enum: [1, 2] } as const).subscribe((_: SpecialIntegers | undefined) => {

      expect().nothing();

      done();

    });

  });

  it('number with const', (done) => {

    storageService.get('test', { type: 'number', const: 1 } as const).subscribe((_: 1 | undefined) => {

      expect().nothing();

      done();

    });

  });

  it('number with enum', (done) => {

    storageService.get('test', { type: 'number', enum: [1, 2] } as const).subscribe((_: 1 | 2 | undefined) => {

      expect().nothing();

      done();

    });

  });

  it('number with enum but no const', (done) => {

    storageService.get('test', { type: 'number', enum: [1, 2] }).subscribe((_: number | undefined) => {

      expect().nothing();

      done();

    });

  });

  it('number with enum predefined', (done) => {

    const schema: JSONSchema = { type: 'number', enum: [1, 2] };

    storageService.get('test', schema).subscribe((_: number | undefined) => {

      expect().nothing();

      done();

    });

  });

  it('number with enum predefined but not typed', (done) => {

    const schema = { type: 'number', enum: [1, 2] };

    // TODO: check this behavior
    // @ts-expect-error
    storageService.get('test', schema).subscribe((_: number | undefined) => {

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

  it('special array of strings', (done) => {

    type Themes = ('dark' | 'light')[];

    // TODO: check
    storageService.get('test', {
      type: 'array',
      items: { type: 'string', enum: ['dark', 'light'] }
    } as const).subscribe((_: Themes | undefined) => {

      expect().nothing();

      done();

    });

  });

  it('special readonly array of strings', (done) => {

    type Themes = readonly ('dark' | 'light')[];

    // TODO: check
    storageService.get('test', {
      type: 'array',
      items: { type: 'string', enum: ['dark', 'light'] }
    } as const).subscribe((_: Themes | undefined) => {

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

  it('special array of numbers', (done) => {

    type NumbersArray = (1 | 2)[];

    storageService.get('test', {
      type: 'array',
      items: { type: 'number', enum: [1, 2] }
    } as const).subscribe((_: NumbersArray | undefined) => {

      expect().nothing();

      done();

    });

  });

  it('special readonly array of numbers', (done) => {

    type NumbersArray = readonly (1 | 2)[];

    storageService.get('test', {
      type: 'array',
      items: { type: 'number', enum: [1, 2] }
    } as const).subscribe((_: NumbersArray | undefined) => {

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

  it('array of arrays', (done) => {

    storageService.get('test', {
      type: 'array',
      items: {
        type: 'array',
        items: { type: 'string' }
      }
    }).subscribe((_: string[][] | undefined) => {

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

    storageService.get('test', {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          test: { type: 'string' }
        },
        required: ['test']
      }
    } as const).subscribe((_: Test[] | undefined) => {

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

    interface TestOptional {
      test?: string;
    }

    storageService.get('test', {
      type: 'object',
      properties: {
        test: { type: 'string' }
      }
    } as const).subscribe((_: TestOptional | undefined) => {

      if (_) {
        _.test = 'dd';
      }

      expect().nothing();

      done();

    });

    storageService.get('test', {
      type: 'object',
      properties: {
        test: { type: 'string' }
      }
    } as const).subscribe((_) => {

      if (_) {
        _.test = 'dd';
      }

      expect().nothing();

      done();

    });

    interface TestRequired {
      test: string;
    }

    storageService.get('test', {
      type: 'object',
      properties: {
        test: { type: 'string' }
      },
      required: ['test']
    } as const).subscribe((_: TestRequired | undefined) => {

      expect().nothing();

      done();

    });

  });

  it('Map', (done) => {

    storageService.get('test', {
      type: 'array',
      items: {
        type: 'array',
        items: [
          { type: 'string' },
          { type: 'number' },
        ],
      },
    } as const).pipe(
      map((result: [string, number][] | undefined) => new Map(result ?? []))
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

  it('schema as const', (done) => {

    interface Test {
      test: string;
    }

    storageService.get<Test>('test', {
      type: 'object',
      properties: {
        test: {
          type: 'string',
          enum: ['hello', 'world'],
        },
        list: {
          type: 'array',
          items: [{ type: 'string' }, { type: 'number' }],
        },
      },
      required: ['test'],
    } as const).subscribe((_: Test | undefined) => {

      expect().nothing();

      done();

    });

  });

});