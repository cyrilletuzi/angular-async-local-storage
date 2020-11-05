import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { StorageModule } from '@ngx-pwa/local-storage';

import { AppComponent } from './app.component';
import { databaseEntries } from './my-storage.service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    StorageModule.forRoot({ databaseEntries }),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
