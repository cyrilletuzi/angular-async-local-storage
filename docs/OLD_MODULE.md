# Module required in versions 4 & 5

An additional setup step is required **for *versions 4 & 5 only***:
**include the `LocalStorageModule`** in your app root module (just once, do NOT re-import it in your submodules).

```typescript
import { LocalStorageModule } from '@ngx-pwa/local-storage';

@NgModule({
  imports: [
    BrowserModule,
    LocalStorageModule,
    ...
  ]
  ...
})
export class AppModule {}
```

[Back to general documentation](../README.md)
