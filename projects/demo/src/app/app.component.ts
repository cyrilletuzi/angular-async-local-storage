import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { LocalStorage, JSONSchema } from '@ngx-pwa/local-storage';
import { catchError, mergeMap } from 'rxjs/operators';
import { DataService } from './data.service';

interface Data {
  title: string;
}

@Component({
  selector: 'app-root',
  template: `
    <p id="get-item">{{(getItem$ | async)?.title}}</p>
    <p id="schema-error">{{schemaError$ | async}}</p>
    <p id="remove-item">{{removeItem$ | async}}</p>
    <p id="clear">{{clear}}</p>
    <p id="size">{{size$ | async}}</p>
    <p id="length">{{length$ | async}}</p>
    <p id="keys">{{keys$ | async | json}}</p>
    <p id="has" [hidden]="has$ | async">Should not be seen</p>
    <p id="service">{{service$ | async}}</p>
    <iframe src="http://localhost:8080"></iframe>
  `
})
export class AppComponent implements OnInit {

  getItem$!: Observable<Data | null>;
  schemaError$!: Observable<string | null>;
  removeItem$!: Observable<string | null>;
  clear: string | null = 'hello world';
  size$!: Observable<number>;
  length$!: Observable<number>;
  keys$!: Observable<string[]>;
  has$!: Observable<boolean>;
  service$!: Observable<string | null>;

  constructor(private localStorage: LocalStorage, private dataService: DataService) {}

  ngOnInit() {

    const schema: JSONSchema = {
      type: 'object',
      properties: {
        title: { type: 'string' },
      },
      required: ['title'],
    };

    this.localStorage.setItem('clear', 'test').pipe(
      mergeMap(() => this.localStorage.clear()),
      mergeMap(() => this.localStorage.getItem('clear', { type: 'string' })),
    ).subscribe((result) => {

      /* Waiting for the `.clear()` to be done before other operations,
       * as all operations are asynchronous, `.clear()` could interfer with the other tests */

      this.clear = result;

      this.getItem$ = this.localStorage.setItem('getItemTest', { title: 'hello world' }).pipe(
        mergeMap(() => this.localStorage.getItem<Data>('getItemTest', schema)),
      );

      this.schemaError$ = this.localStorage.setItem('schemaError', { wrong: 'test' }).pipe(
        mergeMap(() => this.localStorage.getItem('schemaError', schema)),
        catchError(() => of('schema error')),
      );

      this.removeItem$ = this.localStorage.setItem('removeItem', 'test').pipe(
        mergeMap(() => this.localStorage.removeItem('removeItem')),
        mergeMap(() => this.localStorage.getItem('removeItem', { type: 'string' })),
      );

      this.size$ = this.localStorage.setItem('size1', 'test').pipe(
        mergeMap(() => this.localStorage.setItem('size2', 'test')),
        mergeMap(() => this.localStorage.size),
      );

      this.length$ = this.localStorage.setItem('size1', 'test').pipe(
        mergeMap(() => this.localStorage.setItem('size2', 'test')),
        mergeMap(() => this.localStorage.length),
      );

      this.keys$ = this.localStorage.setItem('keys', 'test').pipe(
        mergeMap(() => this.localStorage.keys()),
      );

      this.has$ = this.localStorage.setItem('has', 'test').pipe(
        mergeMap(() => this.localStorage.has('has')),
      );

      this.service$ = this.dataService.data$;

    });

  }

}
