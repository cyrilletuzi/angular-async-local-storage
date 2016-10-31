import { NgModule } from '@angular/core';
import { AsyncLocalStorage } from './async-local-storage';
export var AsyncLocalStorageModule = (function () {
    function AsyncLocalStorageModule() {
    }
    AsyncLocalStorageModule.decorators = [
        { type: NgModule, args: [{
                    providers: [AsyncLocalStorage]
                },] },
    ];
    /** @nocollapse */
    AsyncLocalStorageModule.ctorParameters = [];
    return AsyncLocalStorageModule;
}());
//# sourceMappingURL=async-local-storage_module.js.map