import { NgModule, ModuleWithProviders } from '@angular/core';

import { LS_PREFIX, IDB_DB_NAME, IDB_STORE_NAME, IDB_DB_VERSION, IDB_NO_WRAP, StorageConfig } from './tokens';

/**
 * This module does not contain anything, it's only useful to provide options via `.forRoot()`.
 */
@NgModule()
export class StorageModule {

  /**
   * Only useful to provide options, otherwise it does nothing.
   * **Must be used at initialization, ie. in `AppModule`, and must not be loaded again in another module.**
   *
   * @example
   * NgModule({
   *   imports: [StorageModule.forRoot({
   *     LSPrefix: 'custom_',
   *   })]
   * })
   * export class AppModule
   */
  static forRoot(config: StorageConfig): ModuleWithProviders {
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
