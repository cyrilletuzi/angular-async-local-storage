import { Injectable } from '@angular/core';
import { AsyncLocalDatabase } from './databases/async-local-database';
var AsyncLocalStorage = (function () {
    /**
     * Injects a local database
     */
    function AsyncLocalStorage(database) {
        this.database = database;
    }
    /**
     * Gets an item value in local storage
     * @param key The item's key
     * @returns The item's value if the key exists, null otherwise, wrapped in an RxJS Observable
     */
    AsyncLocalStorage.prototype.getItem = function (key) {
        return this.database.getItem(key);
    };
    /**
     * Sets an item in local storage
     * @param key The item's key
     * @param data The item's value, must NOT be null or undefined
     * @returns An RxJS Observable to wait the end of the operation
     */
    AsyncLocalStorage.prototype.setItem = function (key, data) {
        return this.database.setItem(key, data);
    };
    /**
     * Deletes an item in local storage
     * @param key The item's key
     * @returns An RxJS Observable to wait the end of the operation
     */
    AsyncLocalStorage.prototype.removeItem = function (key) {
        return this.database.removeItem(key);
    };
    /**
     * Deletes all items from local storage
     * @returns An RxJS Observable to wait the end of the operation
     */
    AsyncLocalStorage.prototype.clear = function () {
        return this.database.clear();
    };
    return AsyncLocalStorage;
}());
export { AsyncLocalStorage };
AsyncLocalStorage.decorators = [
    { type: Injectable },
];
/** @nocollapse */
AsyncLocalStorage.ctorParameters = function () { return [
    { type: AsyncLocalDatabase, },
]; };
//# sourceMappingURL=async-local-storage.js.map