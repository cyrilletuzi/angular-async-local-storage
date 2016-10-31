import { NgModule } from '@angular/core';

import { AsyncLocalStorage } from './async-local-storage';

@NgModule({
    providers: [ AsyncLocalStorage ]
})
export class AsyncLocalStorageModule {}
