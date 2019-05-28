import * as localForage from 'localforage';
import { Component, OnInit } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';

@Component({
  selector: 'app-root',
  template: `
    <h1>{{title}}</h1>
    <router-outlet></router-outlet>
  `,
  styles: ['']
})
export class AppComponent implements OnInit {

  title = 'not ok';

  constructor(private storageMap: StorageMap) {}

  ngOnInit() {

    const key = 'key';
    const value = 'hello world';

    localForage.setItem(key, value).then(() => {

      this.storageMap.get(key, { type: 'string' }).subscribe((result) => {
        this.title = result || 'not ok';
      });

    });

  }

}
