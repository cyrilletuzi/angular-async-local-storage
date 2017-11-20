import { TestBed, inject, async } from '@angular/core/testing';
import { map } from 'rxjs/operators';

import { AsyncLocalStorage } from './lib.service';
import { IndexedDBDatabase, LocalStorageDatabase, MockLocalDatabase } from './databases/index';
import { JSONSchema, JSONValidator } from './validation/index';

function testGetItem<T>(type: 'primitive' | 'object', localStorage: AsyncLocalStorage, value: T, done: DoneFn) {

  localStorage.setItem('test', value).subscribe(() => {

    localStorage.getItem<T>('test').subscribe((data) => {

      if (type === 'primitive') {
        expect(data).toBe(value);
      } else {
        expect(data).toEqual(value);
      }

      done();

    });

  });

}

function testGetItemPrimitive<T>(localStorage: AsyncLocalStorage, value: T, done: DoneFn) {

  testGetItem<T>('primitive', localStorage, value, done);

}

function testGetItemObject<T>(localStorage: AsyncLocalStorage, value: T, done: DoneFn) {

  testGetItem<T>('object', localStorage, value, done);

}

function tests(localStorage: AsyncLocalStorage) {

  beforeEach((done: DoneFn) => {
    localStorage.clear().subscribe(() => {
      done();
    });
  });

  it('should return null on unknown index', (done: DoneFn) => {

    localStorage.getItem('unknown').subscribe((data) => {

      expect(data).toBeNull();

      done();

    });

  });

  it('should store and return a string', (done: DoneFn) => {

    testGetItemPrimitive<string>(localStorage, 'blue', done);

  });

  it('should store and return an empty string', (done: DoneFn) => {

    testGetItemPrimitive<string>(localStorage, '', done);

  });

  it('should store and return a number', (done: DoneFn) => {

    testGetItemPrimitive<number>(localStorage, 10, done);

  });

  it('should store and return zero', (done: DoneFn) => {

    testGetItemPrimitive<number>(localStorage, 0, done);

  });

  it('should store and return true', (done: DoneFn) => {

    testGetItemPrimitive<boolean>(localStorage, true, done);

  });

  it('should store and return false', (done: DoneFn) => {

    testGetItemPrimitive<boolean>(localStorage, false, done);

  });

  it('should store and return null', (done: DoneFn) => {

    testGetItemPrimitive<null>(localStorage, null, done);

  });

  it('should store and return an array', (done: DoneFn) => {

    testGetItemObject<number[]>(localStorage, [1, 2, 3], done);

  });

  it('should store and return an object', (done: DoneFn) => {

    testGetItemObject<{name: string}>(localStorage, { name: 'test' }, done);

  });

  it('should return null on deleted index', (done: DoneFn) => {

    const index = 'test';

    localStorage.setItem(index, 'test').subscribe(() => {

      localStorage.removeItem(index).subscribe(() => {

        localStorage.getItem<string>(index).subscribe((data) => {

          expect(data).toBeNull();

          done();

        });

      });

    });

  });

  it('should allow to use operators', (done: DoneFn) => {

    const index = 'index';
    const value = 'value';

    localStorage.setItem(index, value).subscribe(() => {

      localStorage.getItem<string>(index).pipe(map((data) => data)).subscribe((data) => {

        expect(data).toBe(value);

        done();

      });

    });

  });

  it('should return null if JSON schema is invalid', (done: DoneFn) => {

    const index = 'index';
    const value = {
      unexpected: 'value'
    };
    const schema: JSONSchema = {
      properties: {
        expected: {
          type: 'string'
        }
      },
      required: ['expected']
    };

    localStorage.setItem(index, value).subscribe(() => {

      localStorage.getItem<{ expected: string }>(index, { schema }).subscribe((data) => {

        expect(data).toBeNull();

        done();

      });

    });

  });

  it('should return the data if JSON schema is valid', (done: DoneFn) => {

    const index = 'index';
    const value = {
      expected: 'value'
    };
    const schema: JSONSchema = {
      properties: {
        expected: {
          type: 'string'
        }
      },
      required: ['expected']
    };

    localStorage.setItem(index, value).subscribe(() => {

      localStorage.getItem<{ expected: string }>(index, { schema }).subscribe((data) => {

        expect(data).toEqual(value);

        done();

      });

    });

  });

}

describe('AsyncLocalStorage with mock storage', () => {

  let localStorage = new AsyncLocalStorage(new MockLocalDatabase(new JSONValidator()));

  tests(localStorage);

});

describe('AsyncLocalStorage with localStorage', () => {

  let localStorage = new AsyncLocalStorage(new LocalStorageDatabase(new JSONValidator()));

  tests(localStorage);

});

describe('AsyncLocalStorage with IndexedDB', () => {

  let localStorage = new AsyncLocalStorage(new IndexedDBDatabase(new JSONValidator()));

  tests(localStorage);

});
