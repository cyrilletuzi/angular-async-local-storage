import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { map, mergeMap, first } from 'rxjs/operators';
import { fromEvent as observableFromEvent }  from 'rxjs/observable/fromEvent';
import { of as observableOf }  from 'rxjs/observable/of';
import { _throw as observableThrow } from 'rxjs/observable/throw';
import { race as observableRace }  from 'rxjs/observable/race';

import { AsyncLocalDatabase } from './async-local-database';

@Injectable()
export class IndexedDBDatabase extends AsyncLocalDatabase {

  /**
   * IndexedDB database name for local storage
   */
  protected readonly dbName = 'ngStorage';
  /**
   * IndexedDB object store name for local storage
   */
  protected readonly objectStoreName = 'localStorage';
  /**
   * IndexedDB key path name for local storage (where an item's key will be stored)
   */
  protected readonly keyPath = 'key';
  /**
   * IndexedDB data path name for local storage (where items' value will be stored)
   */
  protected readonly dataPath = 'value';
  /**
   * IndexedDB database connection, wrapped in a RxJS ReplaySubject to be able to access the connection
   * even after the connection success event happened
   */
  protected database: ReplaySubject<IDBDatabase>;

  /**
   * Connects to IndexedDB
   */
  constructor() {

    super();

    /* Creating the RxJS ReplaySubject */
    this.database = new ReplaySubject<IDBDatabase>();

    /* Connecting to IndexedDB */
    this.connect();

  }

  /**
   * Gets an item value in local storage
   * @param key The item's key
   * @returns The item's value if the key exists, null otherwise, wrapped in an RxJS Observable
   */
  getItem<T = any>(key: string) {

    /* Opening a trasaction and requesting the item in local storage */
    return this.transaction().pipe(
      map((transaction) => transaction.get(key)),
      mergeMap((request) => {

        /* Listening to the success event, and passing the item value if found, null otherwise */
        const success = (observableFromEvent(request, 'success') as Observable<Event>).pipe(
          map((event) => (event.target as IDBRequest).result),
          map((result) => result && (this.dataPath in result) ? (result[this.dataPath] as T) : null)
        );

        /* Merging success and errors events and autoclosing the observable */
        return (observableRace(success, this.toErrorObservable(request, `getter`)) as Observable<T | null>)
          .pipe(first());

      })
    );

  }

  /**
   * Sets an item in local storage
   * @param key The item's key
   * @param data The item's value, must NOT be null or undefined
   * @returns An RxJS Observable to wait the end of the operation
   */
  setItem(key: string, data: any) {

    /* Storing null is not correctly supported by IndexedDB and unnecessary here */
    if (data == null) {

      return observableOf(true);

    }

    /* Opening a transaction and checking if the item already exists in local storage */
    return this.getItem(key).pipe(
      map((existingData) => (existingData == null) ? 'add' : 'put'),
      mergeMap((method) => {

        /* Opening a transaction */
        return this.transaction('readwrite').pipe(mergeMap((transaction) => {

          let request: IDBRequest;

          /* Adding or updating local storage, based on previous checking */
          switch (method) {
            case 'add':
              request = transaction.add({ [this.dataPath]: data }, key);
              break;
            case 'put':
            default:
              request = transaction.put({ [this.dataPath]: data }, key);
              break;
          }

          /* Merging success (passing true) and error events and autoclosing the observable */
          return (observableRace(this.toSuccessObservable(request), this.toErrorObservable(request, `setter`)) as Observable<boolean>)
            .pipe(first());

        }));

      })
    );

  }

  /**
   * Deletes an item in local storage
   * @param key The item's key
   * @returns An RxJS Observable to wait the end of the operation
   */
  removeItem(key: string) {

    /* Opening a transaction and checking if the item exists in local storage */
    return this.getItem(key).pipe(mergeMap((data) => {

      /* If the item exists in local storage */
      if (data != null) {

        /* Opening a transaction */
        return this.transaction('readwrite').pipe(mergeMap((transaction) => {

          /* Deleting the item in local storage */
          const request = transaction.delete(key);

          /* Merging success (passing true) and error events and autoclosing the observable */
          return (observableRace(this.toSuccessObservable(request), this.toErrorObservable(request, `remover`)) as Observable<boolean>)
            .pipe(first());

        }));

      }

      /* Passing true if the item does not exist in local storage */
      return observableOf(true).pipe(first());

    }));

  }

  /**
   * Deletes all items from local storage
   * @returns An RxJS Observable to wait the end of the operation
   */
  clear() {

    /* Opening a transaction */
    return this.transaction('readwrite').pipe(mergeMap((transaction) => {

      /* Deleting all items from local storage */
      const request = transaction.clear();

      /* Merging success (passing true) and error events and autoclosing the observable */
      return (observableRace(this.toSuccessObservable(request), this.toErrorObservable(request, `clearer`)) as Observable<boolean>)
        .pipe(first());

    }));

  }

  /**
   * Connects to IndexedDB and creates the object store on first time
   */
  protected connect() {

    /* Connecting to IndexedDB */
    const request = indexedDB.open(this.dbName);

    /* Listening the event fired on first connection, creating the object store for local storage */
    (observableFromEvent(request, 'upgradeneeded') as Observable<Event>)
      .pipe(first())
      .subscribe((event) => {

        /* Getting the database connection */
        const database = (event.target as IDBRequest).result as IDBDatabase;

        /* Checking if the object store already exists, to avoid error */
        if (!database.objectStoreNames.contains(this.objectStoreName)) {

          /* Creating the object store for local storage */
          database.createObjectStore(this.objectStoreName);

        }

      });

    /* Listening the success event and converting to an RxJS Observable */
    const success = observableFromEvent(request, 'success') as Observable<Event>;

    /* Merging success and errors events */
    (observableRace(success, this.toErrorObservable(request, `connection`)) as Observable<Event>)
      .pipe(first())
      .subscribe((event) => {

        /* Storing the database connection for further access */
        this.database.next((event.target as IDBRequest).result as IDBDatabase);

      });

  }

  /**
   * Opens an IndexedDB transaction and gets the local storage object store
   * @param mode Default to 'readonly' for read operations, or 'readwrite' for write operations
   * @returns An IndexedDB transaction object store, wrapped in an RxJS Observable
   */
  protected transaction(mode: 'readonly' | 'readwrite' = 'readonly') {

    /* From the IndexedDB connection, opening a transaction and getting the local storage objet store */
    return this.database
      .pipe(map((database) => database.transaction([this.objectStoreName], mode).objectStore(this.objectStoreName)));

  }

  /**
   * Transforms a IndexedDB success event in an RxJS Observable
   * @param request The request to listen
   * @returns A RxJS Observable with true value
   */
  protected toSuccessObservable(request: IDBRequest) {

    /* Transforming a IndexedDB success event in an RxJS Observable with true value */
    return (observableFromEvent(request, 'success') as Observable<Event>)
      .pipe(map(() => true));

  }

  /**
   * Transforms a IndexedDB error event in an RxJS ErrorObservable
   * @param request The request to listen
   * @param error Optionnal details about the error's origin
   * @returns A RxJS ErrorObservable
   */
  protected toErrorObservable(request: IDBRequest, error: string = ``) {

    /* Transforming a IndexedDB error event in an RxJS ErrorObservable */
    return (observableFromEvent(request, 'error') as Observable<Event>)
      .pipe(mergeMap(() => observableThrow(new Error(`IndexedDB ${error} issue.`))));

  }

}
