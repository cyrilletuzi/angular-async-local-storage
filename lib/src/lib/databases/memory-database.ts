import { Service } from "@angular/core";
import { Observable, defer, from, of } from "rxjs";
import { LocalDatabase } from "./local-database";

@Service()
export class MemoryDatabase implements LocalDatabase {

  /**
   * Memory storage
   */
  private readonly memoryStorage = new Map<string, unknown>();

  /**
   * Number of items in memory
   */
  get size(): Observable<number> {

    /* Defer to only access storage on subscription, like other databases */
    return defer(() => of(this.memoryStorage.size));

  }

  /**
   * Gets an item value in memory
   * @param key The item's key
   * @returns The item's value if the key exists, `undefined` otherwise, wrapped in a RxJS `Observable`
   */
  get(key: string): Observable<unknown> {

    /* Defer to only access storage on subscription, like other databases */
    return defer(() => of(this.memoryStorage.get(key)));

  }

  /**
   * Sets an item in memory
   * @param key The item's key
   * @param data The item's value
   * @returns A RxJS `Observable` to wait the end of the operation
   */
  set(key: string, data: unknown): Observable<undefined> {

    /* Defer to only access storage on subscription, like other databases */
    return defer(() => {

      this.memoryStorage.set(key, data);

      /* Wrap in a RxJS `Observable` to be consistent with other storages */
      return of(undefined);

    });

  }

  /**
   * Deletes an item in memory
   * @param key The item's key
   * @returns A RxJS `Observable` to wait the end of the operation
   */
  delete(key: string): Observable<undefined> {

    /* Defer to only access storage on subscription, like other databases */
    return defer(() => {

      this.memoryStorage.delete(key);

      /* Wrap in a RxJS `Observable` to be consistent with other storages */
      return of(undefined);

    });

  }

  /**
   * Deletes all items in memory
   * @returns A RxJS `Observable` to wait the end of the operation
   */
  clear(): Observable<undefined> {

    /* Defer to only access storage on subscription, like other databases */
    return defer(() => {

      this.memoryStorage.clear();

      /* Wrap in a RxJS `Observable` to be consistent with other storages */
      return of(undefined);

    });

  }

  /**
   * Get all keys in memory
   * @returns A RxJS `Observable` iterating on keys
   */
  keys(): Observable<string> {

    /* Create an `Observable` from keys, deferred to get a new iterator on each subscription */
    return defer(() => from(this.memoryStorage.keys()));

  }

  /**
   * Check if a key exists in memory
   * @param key Key name
   * @returns a RxJS `Observable` telling if the key exists or not
   */
  has(key: string): Observable<boolean> {

    /* Defer to only access storage on subscription, like other databases */
    return defer(() => of(this.memoryStorage.has(key)));

  }

}
