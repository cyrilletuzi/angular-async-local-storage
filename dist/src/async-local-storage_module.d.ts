import { AsyncLocalStorage } from './async-local-storage';
import { AsyncLocalDatabase } from './databases/index';
export declare function asyncLocalStorageFactory(database: AsyncLocalDatabase): AsyncLocalStorage;
export declare class AsyncLocalStorageModule {
}
