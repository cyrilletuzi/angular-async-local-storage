import { Component, inject, signal, type OnInit } from "@angular/core";
import { StorageMap } from "@ngx-pwa/local-storage";

@Component({
  selector: 'app-page',
  standalone: true,
  template: `
    @if (lazy()) {
      <p id="lazy">{{ lazy() }}</p>
    }
  `,
})
export class Page implements OnInit {

  private readonly storageMap = inject(StorageMap);
  lazy = signal<string | undefined>(undefined);

  ngOnInit(): void {

    this.storageMap.get("key", { type: "string" }).subscribe((result) => {
      if (result !== undefined) {
        this.lazy.set(result);
      }
    });

  }

}
