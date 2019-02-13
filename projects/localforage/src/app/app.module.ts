import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { localStorageProviders } from '@ngx-pwa/local-storage';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    localStorageProviders({
      LSPrefix: 'localforage/',
      IDBDBName: 'localforage',
      IDBStoreName: 'keyvaluepairs'
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
