import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageMap, JSONSchema } from '@ngx-pwa/local-storage';
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
  data$!: Observable<Data | undefined>;

  constructor(private storageMap: StorageMap) {}

  ngOnInit(): void {

    const key = 'test';
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        title: {
          type: 'string'
        }
      }
    };

    this.data$ = this.storageMap.set(key, { title: this.title }).pipe(
      switchMap(() => this.storageMap.get<Data>(key, schema))
    );

  }

}
