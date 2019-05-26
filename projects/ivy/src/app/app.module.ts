import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { StorageModule } from '@ngx-pwa/local-storage';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    StorageModule.forRoot({
      IDBNoWrap: true,
    }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
