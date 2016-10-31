import { NgModule } from '@angular/core';

import { AsyncLocalStorage } from './async-local-storage';
import { AsyncLocalDatabase, IndexedDBDatabase, LocalStorageDatabase, MockLocalDatabase } from './databases/index';

export function asyncLocalStorageFactory() {

    let database: AsyncLocalDatabase;

    try {

        /* Try with IndexedDB in modern browsers */
        database = new IndexedDBDatabase();

    } catch (error) {

        try {

            /* Try with localStorage in old browsers (IE9) */
            database = new LocalStorageDatabase();

        } catch (error) {

            /* Fake database for server-side rendering (Universal) */
            database = new MockLocalDatabase();

        }
        
    }

    return new AsyncLocalStorage(database);

};

@NgModule({
    providers: [
        {
            provide: AsyncLocalStorage, 
            useFactory: asyncLocalStorageFactory
        }
    ]
})
export class AsyncLocalStorageModule {}
