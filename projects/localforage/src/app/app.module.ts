import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { StorageModule } from '@ngx-pwa/local-storage';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    StorageModule.forRoot({
      LSPrefix: 'localforage/',
      IDBDBName: 'localforage',
      IDBStoreName: 'keyvaluepairs'
    }),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
