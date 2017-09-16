import { Component, OnInit } from '@angular/core';
import { AsyncLocalStorage } from 'angular-async-local-storage';

interface User {
  name: string;
}

@Component({
  selector: 'demo-app',
  template: `<p>Should display 'Homer Simpsons' : {{name}}</p>`
})
export class AppComponent implements OnInit {

  name: string;

  constructor(protected localStorage: AsyncLocalStorage) {}

  ngOnInit() {

    const user: User = { name: `Homer Simpsons` };

    this.localStorage.setItem('user', user)
    .subscribe(() => {

      this.localStorage.getItem('user').subscribe((user: User) => {

        this.name = user.name;

      });

    });

  }
}
