import { TestBed, inject, async } from '@angular/core/testing';

import { AsyncLocalStorage } from './lib.service';
import { IndexedDBDatabase, LocalStorageDatabase, MockLocalDatabase } from './databases/index';

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

        localStorage.getItem(index).subscribe((data) => {

          expect(data).toBeNull();

          done();

        });

      });

    });

  });

}

describe('AsyncLocalStorage with mock storage', () => {

  let localStorage = new AsyncLocalStorage(new MockLocalDatabase());

    tests(localStorage);

});

describe('AsyncLocalStorage with localStorage', () => {

  let localStorage = new AsyncLocalStorage(new LocalStorageDatabase());

  tests(localStorage);

});

describe('AsyncLocalStorage with IndexedDB', () => {

  let localStorage = new AsyncLocalStorage(new IndexedDBDatabase());

  tests(localStorage);

});
