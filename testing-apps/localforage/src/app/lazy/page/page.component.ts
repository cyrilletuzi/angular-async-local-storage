import { Component, type OnInit } from "@angular/core";
import { StorageMap } from "@ngx-pwa/local-storage";

@Component({
  standalone: true,
  imports: [],
  template: `
    @if (lazy) {
      <p id="lazy">{{lazy}}</p>
    }
  `,
})
export class PageComponent implements OnInit {

  lazy?: string;

  constructor(private readonly storageMap: StorageMap) {}

  ngOnInit(): void {

    this.storageMap.get("key", { type: "string" }).subscribe((result) => {
      if (result) {
        this.lazy = result;
      }
    });

  }

}
