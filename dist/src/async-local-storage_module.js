import { NgModule } from '@angular/core';
import { AsyncLocalStorage } from './async-local-storage';
import { IndexedDBDatabase } from './databases/index';
export function asyncLocalStorageFactory(database) {
    return new AsyncLocalStorage(database);
}
export var AsyncLocalStorageModule = (function () {
    function AsyncLocalStorageModule() {
    }
    AsyncLocalStorageModule.decorators = [
        { type: NgModule, args: [{
                    providers: [
                        {
                            provide: AsyncLocalStorage,
                            useFactory: asyncLocalStorageFactory,
                            deps: [IndexedDBDatabase]
                        },
                        IndexedDBDatabase
                    ]
                },] },
    ];
    /** @nocollapse */
    AsyncLocalStorageModule.ctorParameters = [];
    return AsyncLocalStorageModule;
}());
//# sourceMappingURL=async-local-storage_module.js.map