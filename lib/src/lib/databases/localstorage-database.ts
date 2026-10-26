import { Service, inject } from "@angular/core";
import { Observable, asyncScheduler, defer, of, throwError } from "rxjs";
import { observeOn } from "rxjs/operators";
import { LS_PREFIX } from "../tokens";
import { SerializationError } from "./exceptions";
import { LocalDatabase } from "./local-database";

@Service()
export class LocalStorageDatabase implements LocalDatabase {

  /**
   * Optional user prefix to avoid collision for multiple apps on the same subdomain
   */
  readonly prefix: string;

  constructor() {

    /* Prefix if asked, or no prefix otherwise */
    this.prefix = inject(LS_PREFIX);

  }

  /**
   * Number of items in `localStorage` (only the ones with the prefix, if any)
   */
  get size(): Observable<number> {

    /* Defer to only access storage on subscription, like other databases */
    return defer(() => of(this.getUnprefixedKeys().length));

  }

  /**
   * Gets an item value in `localStorage`
   * @param key The item's key
   * @returns The item's value if the key exists, `undefined` otherwise, wrapped in a RxJS `Observable`
   */
  get(key: string): Observable<unknown> {

    /* Defer to only access storage on subscription, like other databases */
    return defer(() => {

      /* Get raw data */
      const unparsedData = localStorage.getItem(this.prefixKey(key));

      /* No need to parse if data is `null` or `undefined` */
      if (unparsedData !== null) {

        /* Try to parse */
        try {

          const parsedData: unknown = JSON.parse(unparsedData);

          /* Wrap in a RxJS `Observable` to be consistent with other storages */
          return of(parsedData);

        } catch (error) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
          return throwError(() => error as SyntaxError);
        }

      }

      return of(undefined);

    });

  }

  /**
   * Store an item in `localStorage`
   * @param key The item's key
   * @param data The item's value
   * @returns A RxJS `Observable` to wait the end of the operation
   */
  set(key: string, data: object): Observable<undefined> {

    /* Defer to only access storage on subscription, like other databases */
    return defer(() => {

      // eslint-disable-next-line no-useless-assignment
      let serializedData: StringifyResult<object> | null = null;

      /* Check if data can be serialized */
      const dataPrototype = Object.getPrototypeOf(data);
      if ((typeof data === "object") && !Array.isArray(data) &&
        !((dataPrototype === Object.prototype) || (dataPrototype === null))) {
        return throwError(() => new SerializationError());
      }

      /* Try to stringify (can fail on circular references) */
      try {
        serializedData = JSON.stringify(data);
        if (serializedData === undefined) {
          throw new Error();
        }
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        return throwError(() => error as TypeError);
      }

      /* Can fail if storage quota is exceeded */
      try {
        localStorage.setItem(this.prefixKey(key), serializedData);
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        return throwError(() => error as DOMException);
      }

      /* Wrap in a RxJS `Observable` to be consistent with other storages */
      return of(undefined);

    });

  }

  /**
   * Deletes an item in `localStorage`
   * @param key The item's key
   * @returns A RxJS `Observable` to wait the end of the operation
   */
  delete(key: string): Observable<undefined> {

    /* Defer to only access storage on subscription, like other databases */
    return defer(() => {

      localStorage.removeItem(this.prefixKey(key));

      /* Wrap in a RxJS `Observable` to be consistent with other storages */
      return of(undefined);

    });

  }

  /**
   * Deletes all items in `localStorage` (only the ones with the prefix, if any)
   * @returns A RxJS `Observable` to wait the end of the operation
   */
  clear(): Observable<undefined> {

    /* Defer to only access storage on subscription, like other databases */
    return defer(() => {

      if (this.prefix === "") {

        localStorage.clear();

      } else {

        /* Do not touch other apps data on the same subdomain */
        for (const key of this.getUnprefixedKeys()) {
          localStorage.removeItem(this.prefixKey(key));
        }

      }

      /* Wrap in a RxJS `Observable` to be consistent with other storages */
      return of(undefined);

    });

  }

  /**
   * Get all keys in `localStorage` (only the ones with the prefix, if any)
   * Note the order of the keys may be inconsistent in Firefox
   * @returns A RxJS `Observable` iterating on keys
   */
  keys(): Observable<string> {

    /* Create an `Observable` from keys */
    return new Observable<string>((subscriber) => {

      for (const key of this.getUnprefixedKeys()) {
        subscriber.next(key);
      }

      subscriber.complete();

    }).pipe(
      /* Required to work like other databases which are asynchronous */
      observeOn(asyncScheduler),
    );

  }

  /**
   * Check if a key exists in `localStorage`
   * @param key The item's key
   * @returns A RxJS `Observable` telling if the key exists or not
   */
  has(key: string): Observable<boolean> {

    /* Defer to only access storage on subscription, like other databases */
    return defer(() => of(localStorage.getItem(this.prefixKey(key)) !== null));

  }

  /**
   * Get all unprefixed keys, ignoring keys without the prefix (from other apps on the same subdomain)
   * @returns A snapshot of the keys, so storage can be modified while iterating on it
   */
  private getUnprefixedKeys(): readonly string[] {

    const keys: string[] = [];

    /* Iterate over all the indexes */
    for (let index = 0; index < localStorage.length; index += 1) {

      /* Get the key in storage: may have a prefix */
      const prefixedKey = localStorage.key(index);

      if (prefixedKey?.startsWith(this.prefix) === true) {

        /* If no prefix, the key is already good, otherwise strip the prefix */
        keys.push(prefixedKey.substring(this.prefix.length));

      }

    }

    return keys;

  }

  /**
   * Add the prefix to a key
   * @param key The key name
   * @returns The prefixed key name
   */
  private prefixKey(key: string): string {

    return `${this.prefix}${key}`;

  }

}
