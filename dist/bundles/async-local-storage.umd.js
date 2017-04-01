(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('rxjs/Observable'), require('rxjs/ReplaySubject'), require('rxjs/add/operator/map'), require('rxjs/add/operator/mergeMap'), require('rxjs/add/operator/pluck'), require('rxjs/add/operator/first'), require('rxjs/add/observable/fromEvent'), require('rxjs/add/observable/merge'), require('rxjs/add/observable/throw'), require('rxjs/add/observable/of')) :
	typeof define === 'function' && define.amd ? define(['exports', '@angular/core', 'rxjs/Observable', 'rxjs/ReplaySubject', 'rxjs/add/operator/map', 'rxjs/add/operator/mergeMap', 'rxjs/add/operator/pluck', 'rxjs/add/operator/first', 'rxjs/add/observable/fromEvent', 'rxjs/add/observable/merge', 'rxjs/add/observable/throw', 'rxjs/add/observable/of'], factory) :
	(factory((global.ng = global.ng || {}, global.ng.asyncLocalStorage = global.ng.asyncLocalStorage || {}),global.ng.core,global.Rx,global.Rx));
}(this, (function (exports,_angular_core,rxjs_Observable,rxjs_ReplaySubject) { 'use strict';

var AsyncLocalDatabase = (function () {
    function AsyncLocalDatabase() {
    }
    return AsyncLocalDatabase;
}());

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
AsyncLocalStorage.decorators = [
    { type: _angular_core.Injectable },
];
/** @nocollapse */
AsyncLocalStorage.ctorParameters = function () { return [
    { type: AsyncLocalDatabase, },
]; };

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
        _this.database = new rxjs_ReplaySubject.ReplaySubject();
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
            var success = rxjs_Observable.Observable.fromEvent(request, 'success')
                .pluck('target', 'result')
                .map(function (result) { return result ? result[_this.dataPath] : null; });
            /* Merging success and errors events and autoclosing the observable */
            return rxjs_Observable.Observable.merge(success, _this.toErrorObservable(request, "getter")).first();
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
            return rxjs_Observable.Observable.of(true);
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
                return rxjs_Observable.Observable.merge(_this.toSuccessObservable(request), _this.toErrorObservable(request, "setter")).first();
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
                    return rxjs_Observable.Observable.merge(_this.toSuccessObservable(request), _this.toErrorObservable(request, "remover")).first();
                });
            }
            /* Passing true if the item does not exist in local storage */
            return rxjs_Observable.Observable.of(true).first();
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
            return rxjs_Observable.Observable.merge(_this.toSuccessObservable(request), _this.toErrorObservable(request, "clearer")).first();
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
        rxjs_Observable.Observable.fromEvent(request, 'upgradeneeded').first().subscribe(function (event) {
            /* Getting the database connection */
            var database = event.target.result;
            /* Checking if the object store already exists, to avoid error */
            if (!database.objectStoreNames.contains(_this.objectStoreName)) {
                /* Creating the object store for local storage */
                database.createObjectStore(_this.objectStoreName);
            }
        });
        /* Listening the success event and converting to an RxJS Observable */
        var success = rxjs_Observable.Observable.fromEvent(request, 'success');
        /* Merging success and errors events */
        rxjs_Observable.Observable.merge(success, this.toErrorObservable(request, "connection")).first().subscribe(function (event) {
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
        return rxjs_Observable.Observable.fromEvent(request, 'success').map(function () { return true; });
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
        return rxjs_Observable.Observable.fromEvent(request, 'error').mergeMap(function () { return rxjs_Observable.Observable.throw(new Error("IndexedDB " + error + " issue.")); });
    };
    return IndexedDBDatabase;
}(AsyncLocalDatabase));
IndexedDBDatabase.decorators = [
    { type: _angular_core.Injectable },
];
/** @nocollapse */
IndexedDBDatabase.ctorParameters = function () { return []; };

var __extends$1 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var LocalStorageDatabase = (function (_super) {
    __extends$1(LocalStorageDatabase, _super);
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
                return rxjs_Observable.Observable.throw(new Error("Invalid data in localStorage."));
            }
        }
        return rxjs_Observable.Observable.of(data);
    };
    /**
     * Sets an item in local storage
     * @param key The item's key
     * @param data The item's value, must NOT be null or undefined
     * @returns An RxJS Observable to wait the end of the operation
     */
    LocalStorageDatabase.prototype.setItem = function (key, data) {
        this.localStorage.setItem(key, JSON.stringify(data));
        return rxjs_Observable.Observable.of(true);
    };
    /**
     * Deletes an item in local storage
     * @param key The item's key
     * @returns An RxJS Observable to wait the end of the operation
     */
    LocalStorageDatabase.prototype.removeItem = function (key) {
        this.localStorage.removeItem(key);
        return rxjs_Observable.Observable.of(true);
    };
    /**
     * Deletes all items from local storage
     * @returns An RxJS Observable to wait the end of the operation
     */
    LocalStorageDatabase.prototype.clear = function () {
        this.localStorage.clear();
        return rxjs_Observable.Observable.of(true);
    };
    return LocalStorageDatabase;
}(AsyncLocalDatabase));
LocalStorageDatabase.decorators = [
    { type: _angular_core.Injectable },
];
/** @nocollapse */
LocalStorageDatabase.ctorParameters = function () { return []; };

var __extends$2 = (undefined && undefined.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var MockLocalDatabase = (function (_super) {
    __extends$2(MockLocalDatabase, _super);
    function MockLocalDatabase() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.localStorage = new Map();
        return _this;
    }
    /**
     * Gets an item value in local storage
     * @param key The item's key
     * @returns The item's value if the key exists, null otherwise, wrapped in an RxJS Observable
     */
    MockLocalDatabase.prototype.getItem = function (key) {
        var data = this.localStorage.get(key);
        return rxjs_Observable.Observable.of((data != undefined) ? data : null);
    };
    /**
     * Sets an item in local storage
     * @param key The item's key
     * @param data The item's value, must NOT be null or undefined
     * @returns An RxJS Observable to wait the end of the operation
     */
    MockLocalDatabase.prototype.setItem = function (key, data) {
        this.localStorage.set(key, data);
        return rxjs_Observable.Observable.of(true);
    };
    /**
     * Deletes an item in local storage
     * @param key The item's key
     * @returns An RxJS Observable to wait the end of the operation
     */
    MockLocalDatabase.prototype.removeItem = function (key) {
        this.localStorage.delete(key);
        return rxjs_Observable.Observable.of(true);
    };
    /**
     * Deletes all items from local storage
     * @returns An RxJS Observable to wait the end of the operation
     */
    MockLocalDatabase.prototype.clear = function () {
        this.localStorage.clear();
        return rxjs_Observable.Observable.of(true);
    };
    return MockLocalDatabase;
}(AsyncLocalDatabase));
MockLocalDatabase.decorators = [
    { type: _angular_core.Injectable },
];
/** @nocollapse */
MockLocalDatabase.ctorParameters = function () { return []; };

function asyncLocalStorageFactory() {
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

var AsyncLocalStorageModule = (function () {
    function AsyncLocalStorageModule() {
    }
    return AsyncLocalStorageModule;
}());
AsyncLocalStorageModule.decorators = [
    { type: _angular_core.NgModule, args: [{
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

/**
 * @module
 * @description
 * Entry point for all public APIs of the async local storage package.
 */

exports.AsyncLocalStorageModule = AsyncLocalStorageModule;
exports.AsyncLocalStorage = AsyncLocalStorage;

Object.defineProperty(exports, '__esModule', { value: true });

})));
