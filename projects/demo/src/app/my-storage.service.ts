import { Injectable } from '@angular/core';

import { SafeStorageMap } from '@ngx-pwa/local-storage';

// TODO: schematic to generate this file
export const databaseEntries = {
  testSafeString: {
    schema: { type: 'string' },
  },
} as const;

@Injectable({
  providedIn: 'root'
})
export class MyStorageService extends SafeStorageMap<typeof databaseEntries> {}
