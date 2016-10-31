import { NgModule } from '@angular/core';

import { AsyncLocalStorage }                     from './async-local-storage';
import { AsyncLocalDatabase, IndexedDBDatabase } from './databases/index';

export function asyncLocalStorageFactory(database: AsyncLocalDatabase): AsyncLocalStorage {

    return new AsyncLocalStorage(database);

}

@NgModule({
    providers: [
        {
            provide: AsyncLocalStorage, 
            useFactory: asyncLocalStorageFactory, 
            deps: [ IndexedDBDatabase ]
        },
        IndexedDBDatabase
    ]
})
export class AsyncLocalStorageModule {}
