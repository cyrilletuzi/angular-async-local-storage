import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalStorage, JSONSchema } from '@ngx-pwa/local-storage';
import { switchMap } from 'rxjs/operators';

interface Data {
  title: string;
}

@Component({
  selector: 'app-root',
  template: `
    <h1>{{(data$ | async)?.title}}</h1>
    <router-outlet></router-outlet>
  `
})
export class AppComponent implements OnInit {

  title = 'LocalStorage';
  data$: Observable<Data | null> | null = null;

  constructor(private localStorage: LocalStorage) {}

  ngOnInit() {

    const key = 'test';
    const schema: JSONSchema = {
      properties: {
        title: {
          type: 'string'
        }
      }
    };

    this.data$ = this.localStorage.setItem(key, { title: this.title }).pipe(switchMap(() => this.localStorage.getItem(key, { schema })));

  }

}
