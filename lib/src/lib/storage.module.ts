import { NgModule, type ModuleWithProviders } from "@angular/core";
import { IDB_DB_NAME, IDB_DB_VERSION, IDB_NO_WRAP, IDB_STORE_NAME, LS_PREFIX, type StorageConfig } from "./tokens";

/**
 * This module is only here for backward compatibility, **do not add it by yourself**
 * 
 * @ignore
 */
@NgModule()
export class StorageModule {

  /**
   * Only useful to provide options, otherwise it does nothing.
   * 
   * **Must be used at initialization, ie. in `AppModule`, and must not be loaded again in another module.**
   */
  static forRoot(config: StorageConfig): ModuleWithProviders<StorageModule> {
    return {
      ngModule: StorageModule,
      providers: [
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        config.LSPrefix !== undefined ? { provide: LS_PREFIX, useValue: config.LSPrefix } : [],
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        config.IDBDBName !== undefined ? { provide: IDB_DB_NAME, useValue: config.IDBDBName } : [],
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        config.IDBStoreName !== undefined ? { provide: IDB_STORE_NAME, useValue: config.IDBStoreName } : [],
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        config.IDBDBVersion !== undefined ? { provide: IDB_DB_VERSION, useValue: config.IDBDBVersion } : [],
        (config.IDBNoWrap === false) ? { provide: IDB_NO_WRAP, useValue: config.IDBNoWrap } : [],
      ],
    };
  }

}
