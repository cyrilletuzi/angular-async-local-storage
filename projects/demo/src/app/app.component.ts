import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { LocalStorage, JSONSchema } from '@ngx-pwa/local-storage';
import { switchMap, catchError } from 'rxjs/operators';

interface Data {
  title: string;
}

@Component({
  selector: 'app-root',
  template: `
    <p id="get-item">{{(getItem$ | async)?.title}}</p>
    <p id="schema-error">{{schemaError$ | async}}</p>
    <p id="remove-item">{{removeItem$ | async}}</p>
    <p id="clear">{{clear$ | async}}</p>
    <p id="size">{{size$ | async}}</p>
    <p id="length">{{length$ | async}}</p>
    <p id="keys">{{keys$ | async | json}}</p>
    <p id="has" hidden="!(has$ | async)"></p>
    <iframe src="http://localhost:8080"></iframe>
  `
})
export class AppComponent implements OnInit {

  getItem$!: Observable<Data | null>;
  schemaError$!: Observable<string | null>;
  removeItem$!: Observable<string | null>;
  clear$!: Observable<string | null>;
  size$!: Observable<number>;
  length$!: Observable<number>;
  keys$!: Observable<string[]>;
  has$!: Observable<boolean>;

  constructor(private localStorage: LocalStorage) {}

  ngOnInit() {

    const schema: JSONSchema = {
      type: 'object',
      properties: {
        title: { type: 'string' },
      },
      required: ['title'],
    };

    this.getItem$ = this.localStorage.setItem('getItemTest', { title: 'hello world' }).pipe(
      switchMap(() => this.localStorage.getItem<Data>('getItemTest', schema)),
    );

    this.schemaError$ = this.localStorage.setItem('schemaError', { wrong: 'test' }).pipe(
      switchMap(() => this.localStorage.getItem('schemaError', schema)),
      catchError(() => of('schema error')),
    );

    this.removeItem$ = this.localStorage.setItem('removeItem', 'test').pipe(
      switchMap(() => this.localStorage.removeItem('removeItem')),
      switchMap(() => this.localStorage.getItem<string>('removeItem', schema)),
    );

    this.clear$ = this.localStorage.setItem('clear', 'test').pipe(
      switchMap(() => this.localStorage.clear()),
      switchMap(() => this.localStorage.getItem<string>('clear', schema)),
    );

    this.size$ = this.localStorage.setItem('size1', 'test').pipe(
      switchMap(() => this.localStorage.setItem('size2', 'test')),
      switchMap(() => this.localStorage.size),
    );

    this.length$ = this.localStorage.setItem('size1', 'test').pipe(
      switchMap(() => this.localStorage.setItem('size2', 'test')),
      switchMap(() => this.localStorage.length),
    );

    this.keys$ = this.localStorage.setItem('keys', 'test').pipe(
      switchMap(() => this.localStorage.keys()),
    );

    this.has$ = this.localStorage.setItem('has', 'test').pipe(
      switchMap(() => this.localStorage.has('has')),
    );

  }

}
