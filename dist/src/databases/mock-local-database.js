import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
export var MockLocalDatabase = (function () {
    function MockLocalDatabase() {
        this.localStorage = new Map();
    }
    /**
     * Gets an item value in local storage
     * @param key The item's key
     * @returns The item's value if the key exists, null otherwise, wrapped in an RxJS Observable
     */
    MockLocalDatabase.prototype.getItem = function (key) {
        return Observable.of(this.localStorage.get(key));
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
}());
//# sourceMappingURL=mock-local-database.js.map