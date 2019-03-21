import { Component, OnInit } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';

@Component({
  template: `
    <p id="lazy">{{text}}</p>
  `,
})
export class PageComponent implements OnInit {

  text = 'not ok';

  constructor(private localStorage: LocalStorage) {}

  ngOnInit() {

    this.localStorage.getItem('key', { type: 'string' }).subscribe((result) => {
      this.text = result || 'not ok';
    });

  }

}
