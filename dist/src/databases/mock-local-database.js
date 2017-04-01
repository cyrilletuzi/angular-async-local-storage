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
import { AsyncLocalDatabase } from './async-local-database';
var MockLocalDatabase = (function (_super) {
    __extends(MockLocalDatabase, _super);
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
    return MockLocalDatabase;
}(AsyncLocalDatabase));
export { MockLocalDatabase };
MockLocalDatabase.decorators = [
    { type: Injectable },
];
/** @nocollapse */
MockLocalDatabase.ctorParameters = function () { return []; };
//# sourceMappingURL=mock-local-database.js.map