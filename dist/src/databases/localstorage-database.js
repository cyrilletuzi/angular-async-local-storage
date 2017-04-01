var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import { AsyncLocalDatabase } from './async-local-database';
var LocalStorageDatabase = (function (_super) {
    __extends(LocalStorageDatabase, _super);
    function LocalStorageDatabase() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /* Initializing native localStorage right now to be able to check its support on class instanciation */
        _this.localStorage = localStorage;
        return _this;
    }
    /**
     * Gets an item value in local storage
     * @param key The item's key
     * @returns The item's value if the key exists, null otherwise, wrapped in an RxJS Observable
     */
    LocalStorageDatabase.prototype.getItem = function (key) {
        var data = this.localStorage.getItem(key);
        if (data != null) {
            try {
                data = JSON.parse(data);
            }
            catch (error) {
                return Observable.throw(new Error("Invalid data in localStorage."));
            }
        }
        return Observable.of(data);
    };
    /**
     * Sets an item in local storage
     * @param key The item's key
     * @param data The item's value, must NOT be null or undefined
     * @returns An RxJS Observable to wait the end of the operation
     */
    LocalStorageDatabase.prototype.setItem = function (key, data) {
        this.localStorage.setItem(key, JSON.stringify(data));
        return Observable.of(true);
    };
    /**
     * Deletes an item in local storage
     * @param key The item's key
     * @returns An RxJS Observable to wait the end of the operation
     */
    LocalStorageDatabase.prototype.removeItem = function (key) {
        this.localStorage.removeItem(key);
        return Observable.of(true);
    };
    /**
     * Deletes all items from local storage
     * @returns An RxJS Observable to wait the end of the operation
     */
    LocalStorageDatabase.prototype.clear = function () {
        this.localStorage.clear();
        return Observable.of(true);
    };
    return LocalStorageDatabase;
}(AsyncLocalDatabase));
export { LocalStorageDatabase };
LocalStorageDatabase.decorators = [
    { type: Injectable },
];
/** @nocollapse */
LocalStorageDatabase.ctorParameters = function () { return []; };
//# sourceMappingURL=localstorage-database.js.map