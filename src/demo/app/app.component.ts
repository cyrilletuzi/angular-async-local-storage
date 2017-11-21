import { Component, OnInit } from '@angular/core';
import { AsyncLocalStorage } from 'angular-async-local-storage';

interface User {
  name: string;
}

@Component({
  selector: 'demo-app',
  template: `
    <p>Should display 'Homer Simpsons' : {{name}}</p>
    <p>Should display 'Schema invalid' : {{validation}}</p>
  `
})
export class AppComponent implements OnInit {

  name: string;
  validation: string;

  constructor(protected localStorage: AsyncLocalStorage) {}

  ngOnInit() {

    const user: User = { name: `Homer Simpsons` };

    this.localStorage.removeItem('user').subscribe(() => {

      this.localStorage.setItem('user', user).subscribe(() => {

        this.localStorage.getItem<User>('user').subscribe((data) => {

          this.name = data ? data.name : '';

        });

        this.localStorage.getItem<User>('user', { schema: { type: 'string' } }).subscribe((data) => {

          this.validation = data ? data.name : 'Schema invalid';

        });

      });

    });

  }
}
