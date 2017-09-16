import { TestBed, inject } from '@angular/core/testing';

import { AsyncLocalStorage } from './lib.service';

describe('LibService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AsyncLocalStorage]
    });
  });

  it('should create service', inject([AsyncLocalStorage], (service: AsyncLocalStorage) => {
    expect(service).toBeTruthy();
  }));
});
