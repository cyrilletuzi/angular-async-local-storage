import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AsyncLocalStorageModule } from 'angular-async-local-storage';

import { AppComponent }  from './app.component';

@NgModule({
  imports:      [ BrowserModule, AsyncLocalStorageModule ],
  declarations: [ AppComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
