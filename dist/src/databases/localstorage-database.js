import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
export var LocalStorageDatabase = (function () {
    function LocalStorageDatabase() {
        /* Initializing native localStorage right now to be able to check its support on class instanciation */
        this.localStorage = localStorage;
    }
    /**
     * Gets an item value in local storage
     * @param key The item's key
     * @returns The item's value if the key exists, null otherwise, wrapped in an RxJS Observable
     */
    LocalStorageDatabase.prototype.getItem = function (key) {
        var data;
        try {
            data = JSON.parse(this.localStorage.getItem(key));
        }
        catch (error) {
            return Observable.throw(new Error("Invalid data in localStorage."));
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
    LocalStorageDatabase.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    LocalStorageDatabase.ctorParameters = [];
    return LocalStorageDatabase;
}());
//# sourceMappingURL=localstorage-database.js.map