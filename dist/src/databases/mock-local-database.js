var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { AsyncLocalDatabase } from './async-local-database';
export var MockLocalDatabase = (function (_super) {
    __extends(MockLocalDatabase, _super);
    function MockLocalDatabase() {
        _super.apply(this, arguments);
        this.localStorage = new Map();
    }
    /**
     * Gets an item value in local storage
     * @param key The item's key
     * @returns The item's value if the key exists, null otherwise, wrapped in an RxJS Observable
     */
    MockLocalDatabase.prototype.getItem = function (key) {
        var data = this.localStorage.get(key);
        return Observable.of((data != undefined) ? data : null);
    };
    /**
     * Sets an item in local storage
     * @param key The item's key
     * @param data The item's value, must NOT be null or undefined
     * @returns An RxJS Observable to wait the end of the operation
     */
    MockLocalDatabase.prototype.setItem = function (key, data) {
        this.localStorage.set(key, data);
        return Observable.of(true);
    };
    /**
     * Deletes an item in local storage
     * @param key The item's key
     * @returns An RxJS Observable to wait the end of the operation
     */
    MockLocalDatabase.prototype.removeItem = function (key) {
        this.localStorage.delete(key);
        return Observable.of(true);
    };
    /**
     * Deletes all items from local storage
     * @returns An RxJS Observable to wait the end of the operation
     */
    MockLocalDatabase.prototype.clear = function () {
        this.localStorage.clear();
        return Observable.of(true);
    };
    MockLocalDatabase.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    MockLocalDatabase.ctorParameters = [];
    return MockLocalDatabase;
}(AsyncLocalDatabase));
//# sourceMappingURL=mock-local-database.js.map