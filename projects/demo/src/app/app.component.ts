import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, mergeMap, toArray } from 'rxjs/operators';
import { StorageMap, JSONSchema } from '@ngx-pwa/local-storage';

import { DataService } from './data.service';
import { MyStorageService } from './my-storage.service';

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
    <p id="length">{{length$ | async}}</p>
    <p id="keys">{{keys$ | async | json}}</p>
    <p id="has" [hidden]="has$ | async">Should not be seen</p>
    <p id="safe-get">{{safeGet$ | async}}</p>
    <p id="service">{{service$ | async}}</p>
    <iframe src="http://localhost:8080"></iframe>
  `
})
export class AppComponent implements OnInit {

  getItem$!: Observable<Data | undefined>;
  schemaError$!: Observable<string | undefined>;
  removeItem$!: Observable<string | undefined>;
  clear: string | undefined = 'hello world';
  size$!: Observable<number>;
  length$!: Observable<number>;
  keys$!: Observable<string[]>;
  has$!: Observable<boolean>;
  service$!: Observable<string | undefined>;

  safeGet$!: Observable<string | undefined>;

  constructor(
    private storage: StorageMap,
    private safeStorage: MyStorageService,
    private dataService: DataService,
  ) {}

  ngOnInit(): void {

    const schema: JSONSchema = {
      type: 'object',
      properties: {
        title: { type: 'string' },
      },
      required: ['title'],
    };

    this.storage.set('clear', 'test').pipe(
      mergeMap(() => this.storage.clear()),
      mergeMap(() => this.storage.get('clear', { type: 'string' })),
    ).subscribe((result) => {

      /* Waiting for the `.clear()` to be done before other operations,
       * as all operations are asynchronous, `.clear()` could interfer with the other tests */

      this.clear = result;

      this.getItem$ = this.storage.set('getItemTest', { title: 'hello world' }).pipe(
        mergeMap(() => this.storage.get<Data>('getItemTest', schema)),
      );

      this.schemaError$ = this.storage.set('schemaError', { wrong: 'test' }).pipe(
        // tslint:disable-next-line: no-any
        mergeMap(() => this.storage.get('schemaError', schema as any)),
        catchError(() => of('schema error')),
      );

      this.removeItem$ = this.storage.set('removeItem', 'test').pipe(
        mergeMap(() => this.storage.delete('removeItem')),
        mergeMap(() => this.storage.get('removeItem', { type: 'string' })),
      );

      this.length$ = this.storage.set('size1', 'test').pipe(
        mergeMap(() => this.storage.set('size2', 'test')),
        mergeMap(() => this.storage.size),
      );

      this.keys$ = this.storage.set('keys', 'test').pipe(
        mergeMap(() => this.storage.keys()),
        toArray(),
      );

      this.has$ = this.storage.set('has', 'test').pipe(
        mergeMap(() => this.storage.has('has')),
      );

      this.safeGet$ = this.safeStorage.set('testSafeString', 'hello safe world').pipe(
        mergeMap(() => this.safeStorage.get('testSafeString')),
      );

      this.service$ = this.dataService.data$;

    });

  }

}
