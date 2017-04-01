import { NgModule } from '@angular/core';
import { AsyncLocalStorage } from './async-local-storage';
import { IndexedDBDatabase, LocalStorageDatabase, MockLocalDatabase } from './databases/index';
export function asyncLocalStorageFactory() {
    var database;
    try {
        /* Try with IndexedDB in modern browsers */
        database = new IndexedDBDatabase();
    }
    catch (error) {
        try {
            /* Try with localStorage in old browsers (IE9) */
            database = new LocalStorageDatabase();
        }
        catch (error) {
            /* Fake database for server-side rendering (Universal) */
            database = new MockLocalDatabase();
        }
    }
    return new AsyncLocalStorage(database);
}
;
var AsyncLocalStorageModule = (function () {
    function AsyncLocalStorageModule() {
    }
    return AsyncLocalStorageModule;
}());
export { AsyncLocalStorageModule };
AsyncLocalStorageModule.decorators = [
    { type: NgModule, args: [{
                providers: [
                    {
                        provide: AsyncLocalStorage,
                        useFactory: asyncLocalStorageFactory
                    }
                ]
            },] },
];
/** @nocollapse */
AsyncLocalStorageModule.ctorParameters = function () { return []; };
//# sourceMappingURL=async-local-storage_module.js.map