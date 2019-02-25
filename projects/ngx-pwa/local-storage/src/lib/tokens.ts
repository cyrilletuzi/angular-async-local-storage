import { InjectionToken, Provider } from '@angular/core';

/**
 * Avoid using this directly, use `localStorageProviders()` for configuration.
 * It will be removed in v8.
 */
export const LOCAL_STORAGE_PREFIX = new InjectionToken<string>('localStoragePrefix', { providedIn: 'root', factory: () => '' });

export interface LocalStorageProvidersConfig {

  /** Optional prefix to avoid collision in multiple apps on same subdomain */
  prefix?: string;
}

export function localStorageProviders(config: LocalStorageProvidersConfig): Provider[] {
  return [
    config.prefix ? { provide: LOCAL_STORAGE_PREFIX, useValue: config.prefix } : []
  ];
}
