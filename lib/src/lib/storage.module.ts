import { NgModule, type ModuleWithProviders } from "@angular/core";
import { IDB_DB_NAME, IDB_DB_VERSION, IDB_NO_WRAP, IDB_STORE_NAME, LS_PREFIX, type StorageConfig } from "./tokens";

/**
 * This module is only here for backward compatibility, do not add it by yourself
 */
@NgModule()
export class StorageModule { // eslint-disable-line @typescript-eslint/no-extraneous-class

  /**
   * Only useful to provide options, otherwise it does nothing.
   * **Must be used at initialization, ie. in `AppModule`, and must not be loaded again in another module.**
   * 
   */
  static forRoot(config: StorageConfig): ModuleWithProviders<StorageModule> {
    return {
      ngModule: StorageModule,
      providers: [
        config.LSPrefix ? { provide: LS_PREFIX, useValue: config.LSPrefix } : [],
        config.IDBDBName ? { provide: IDB_DB_NAME, useValue: config.IDBDBName } : [],
        config.IDBStoreName ? { provide: IDB_STORE_NAME, useValue: config.IDBStoreName } : [],
        config.IDBDBVersion ? { provide: IDB_DB_VERSION, useValue: config.IDBDBVersion } : [],
        (config.IDBNoWrap === false) ? { provide: IDB_NO_WRAP, useValue: config.IDBNoWrap } : [],
      ],
    };
  }

}
