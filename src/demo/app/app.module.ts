import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LocalStorageModule } from '@ngx-pwa/local-storage';

import { AppComponent }  from './app.component';

@NgModule({
  imports:      [ BrowserModule, LocalStorageModule ],
  declarations: [ AppComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
