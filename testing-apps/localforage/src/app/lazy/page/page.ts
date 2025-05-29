import { Component, type OnInit } from "@angular/core";
import { StorageMap } from "@ngx-pwa/local-storage";

@Component({
  selector: 'app-page',
  standalone: true,
  template: `
    @if (lazy) {
      <p id="lazy">{{ lazy }}</p>
    }
  `,
})
export class Page implements OnInit {

  lazy?: string;

  constructor(
    private readonly storageMap: StorageMap,
  ) {}

  ngOnInit(): void {

    this.storageMap.get("key", { type: "string" }).subscribe((result) => {
      if (result !== undefined) {
        this.lazy = result;
      }
    });

  }

}
