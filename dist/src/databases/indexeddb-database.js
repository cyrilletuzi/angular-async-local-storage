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
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/pluck';
import 'rxjs/add/operator/first';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/of';
import { AsyncLocalDatabase } from './async-local-database';
var IndexedDBDatabase = (function (_super) {
    __extends(IndexedDBDatabase, _super);
    /**
     * Connects to IndexedDB
     */
    function IndexedDBDatabase() {
        var _this = _super.call(this) || this;
        /**
         * IndexedDB database name for local storage
         */
        _this.dbName = 'ngStorage';
        /**
         * IndexedDB object store name for local storage
         */
        _this.objectStoreName = 'localStorage';
        /**
         * IndexedDB key path name for local storage (where an item's key will be stored)
         */
        _this.keyPath = 'key';
        /**
         * IndexedDB data path name for local storage (where items' value will be stored)
         */
        _this.dataPath = 'value';
        /* Creating the RxJS ReplaySubject */
        _this.database = new ReplaySubject();
        /* Connecting to IndexedDB */
        _this.connect();
        return _this;
    }
    /**
     * Gets an item value in local storage
     * @param key The item's key
     * @returns The item's value if the key exists, null otherwise, wrapped in an RxJS Observable
     */
    IndexedDBDatabase.prototype.getItem = function (key) {
        var _this = this;
        /* Opening a trasaction and requesting the item in local storage */
        return this.transaction().map(function (transaction) { return transaction.get(key); }).mergeMap(function (request) {
            /* Listening to the success event, and passing the item value if found, null otherwise */
            var success = Observable.fromEvent(request, 'success')
                .pluck('target', 'result')
                .map(function (result) { return result ? result[_this.dataPath] : null; });
            /* Merging success and errors events and autoclosing the observable */
            return Observable.merge(success, _this.toErrorObservable(request, "getter")).first();
        });
    };
    /**
     * Sets an item in local storage
     * @param key The item's key
     * @param data The item's value, must NOT be null or undefined
     * @returns An RxJS Observable to wait the end of the operation
     */
    IndexedDBDatabase.prototype.setItem = function (key, data) {
        var _this = this;
        /* Storing null is not correctly supported by IndexedDB and unnecessary here */
        if (data == null) {
            return Observable.of(true);
        }
        /* Opening a transaction and checking if the item already exists in local storage */
        return this.getItem(key).map(function (data) { return (data == null) ? 'add' : 'put'; }).mergeMap(function (method) {
            /* Opening a transaction */
            return _this.transaction('readwrite').mergeMap(function (transaction) {
                var request;
                /* Adding or updating local storage, based on previous checking */
                switch (method) {
                    case 'add':
                        request = transaction.add((_a = {}, _a[_this.dataPath] = data, _a), key);
                        break;
                    case 'put':
                    default:
                        request = transaction.put((_b = {}, _b[_this.dataPath] = data, _b), key);
                        break;
                }
                /* Merging success (passing true) and error events and autoclosing the observable */
                return Observable.merge(_this.toSuccessObservable(request), _this.toErrorObservable(request, "setter")).first();
                var _a, _b;
            });
        });
    };
    /**
     * Deletes an item in local storage
     * @param key The item's key
     * @returns An RxJS Observable to wait the end of the operation
     */
    IndexedDBDatabase.prototype.removeItem = function (key) {
        var _this = this;
        /* Opening a transaction and checking if the item exists in local storage */
        return this.getItem(key).mergeMap(function (data) {
            /* If the item exists in local storage */
            if (data != null) {
                /* Opening a transaction */
                return _this.transaction('readwrite').mergeMap(function (transaction) {
                    /* Deleting the item in local storage */
                    var request = transaction.delete(key);
                    /* Merging success (passing true) and error events and autoclosing the observable */
                    return Observable.merge(_this.toSuccessObservable(request), _this.toErrorObservable(request, "remover")).first();
                });
            }
            /* Passing true if the item does not exist in local storage */
            return Observable.of(true).first();
        });
    };
    /**
     * Deletes all items from local storage
     * @returns An RxJS Observable to wait the end of the operation
     */
    IndexedDBDatabase.prototype.clear = function () {
        var _this = this;
        /* Opening a transaction */
        return this.transaction('readwrite').mergeMap(function (transaction) {
            /* Deleting all items from local storage */
            var request = transaction.clear();
            /* Merging success (passing true) and error events and autoclosing the observable */
            return Observable.merge(_this.toSuccessObservable(request), _this.toErrorObservable(request, "clearer")).first();
        });
    };
    /**
     * Connects to IndexedDB and creates the object store on first time
     */
    IndexedDBDatabase.prototype.connect = function () {
        var _this = this;
        /* Connecting to IndexedDB */
        var request = indexedDB.open(this.dbName);
        /* Listening the event fired on first connection, creating the object store for local storage */
        Observable.fromEvent(request, 'upgradeneeded').first().subscribe(function (event) {
            /* Getting the database connection */
            var database = event.target.result;
            /* Checking if the object store already exists, to avoid error */
            if (!database.objectStoreNames.contains(_this.objectStoreName)) {
                /* Creating the object store for local storage */
                database.createObjectStore(_this.objectStoreName);
            }
        });
        /* Listening the success event and converting to an RxJS Observable */
        var success = Observable.fromEvent(request, 'success');
        /* Merging success and errors events */
        Observable.merge(success, this.toErrorObservable(request, "connection")).first().subscribe(function (event) {
            /* Storing the database connection for further access */
            _this.database.next(event.target.result);
        });
    };
    /**
     * Opens an IndexedDB transaction and gets the local storage object store
     * @param mode Default to 'readonly' for read operations, or 'readwrite' for write operations
     * @returns An IndexedDB transaction object store, wrapped in an RxJS Observable
     */
    IndexedDBDatabase.prototype.transaction = function (mode) {
        var _this = this;
        if (mode === void 0) { mode = 'readonly'; }
        /* From the IndexedDB connection, opening a transaction and getting the local storage objet store */
        return this.database.map(function (database) { return database.transaction([_this.objectStoreName], mode).objectStore(_this.objectStoreName); });
    };
    /**
     * Transforms a IndexedDB success event in an RxJS Observable
     * @param request The request to listen
     * @returns A RxJS Observable with true value
     */
    IndexedDBDatabase.prototype.toSuccessObservable = function (request) {
        /* Transforming a IndexedDB success event in an RxJS Observable with true value */
        return Observable.fromEvent(request, 'success').map(function () { return true; });
    };
    /**
     * Transforms a IndexedDB error event in an RxJS ErrorObservable
     * @param request The request to listen
     * @param error Optionnal details about the error's origin
     * @returns A RxJS ErrorObservable
     */
    IndexedDBDatabase.prototype.toErrorObservable = function (request, error) {
        if (error === void 0) { error = ""; }
        /* Transforming a IndexedDB error event in an RxJS ErrorObservable */
        return Observable.fromEvent(request, 'error').mergeMap(function () { return Observable.throw(new Error("IndexedDB " + error + " issue.")); });
    };
    return IndexedDBDatabase;
}(AsyncLocalDatabase));
export { IndexedDBDatabase };
IndexedDBDatabase.decorators = [
    { type: Injectable },
];
/** @nocollapse */
IndexedDBDatabase.ctorParameters = function () { return []; };
//# sourceMappingURL=indexeddb-database.js.map