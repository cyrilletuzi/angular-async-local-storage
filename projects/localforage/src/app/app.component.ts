import * as localForage from 'localforage';
import { Component, OnInit } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';

@Component({
  selector: 'app-root',
  template: `<h1>{{title}}</h1>`,
  styles: ['']
})
export class AppComponent implements OnInit {

  title = 'not ok';

  constructor(private localStorage: LocalStorage) {}

  ngOnInit() {

    const key = 'key';
    const value = 'hello world';

    localForage.setItem(key, value).then(() => {

      this.localStorage.getItem(key, { type: 'string' }).subscribe({ next: (result) => {
        this.title = result || 'not ok';
      } });

    });

  }

}
