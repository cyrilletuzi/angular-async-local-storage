import { Inject } from '@angular/core';
import { Observable, OperatorFunction, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { LocalDatabase, LocalStorageDatabase, IDB_BROKEN_ERROR } from '../databases';
import { JSONValidator } from '../validation';
import { LS_PREFIX, LOCAL_STORAGE_PREFIX } from '../tokens';

export abstract class StorageCommon {

  /**
   * Constructor params are provided by Angular (but can also be passed manually in tests)
   * @param database Storage to use
   * @param jsonValidator Validator service
   * @param LSPrefix Prefix for `localStorage` keys to avoid collision for multiple apps on the same subdomain or for interoperability
   * @param oldPrefix Prefix option prior to v8 to avoid collision for multiple apps on the same subdomain or for interoperability
   */
  constructor(
    protected database: LocalDatabase,
    protected jsonValidator: JSONValidator = new JSONValidator(),
    @Inject(LS_PREFIX) protected LSPrefix = '',
    // tslint:disable-next-line: deprecation
    @Inject(LOCAL_STORAGE_PREFIX) protected oldPrefix = '',
  ) {}

  /**
   * RxJS operator to catch if `indexedDB` is broken
   * @param operationCallback Callback with the operation to redo
   */
  protected catchIDBBroken<T>(operationCallback: () => Observable<T>): OperatorFunction<T, T> {

    return catchError((error) => {

      /* Check if `indexedDB` is broken based on error message (the specific error class seems to be lost in the process) */
      if ((error !== undefined) && (error !== null) && (error.message === IDB_BROKEN_ERROR)) {

        /* Fallback to `localStorage` */
        this.database = new LocalStorageDatabase(this.LSPrefix, this.oldPrefix);

        /* Redo the operation */
        return operationCallback();

      } else {

        /* Otherwise, rethrow the error */
        return throwError(error);

      }

    });

  }

}
