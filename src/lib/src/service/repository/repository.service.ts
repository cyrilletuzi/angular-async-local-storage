import { AsyncLocalStorage } from '../lib.service';
import { Injectable } from '@angular/core';
import { RepositoryInstance } from './repository.instance';

@Injectable()
export class RepositoryService {

  cache: { [key: string]: RepositoryInstance<any> };

  constructor(
    public localStorage: AsyncLocalStorage
  ) { }


  public getInstance<TModel>(ctor: { new(): TModel }): RepositoryInstance<TModel> {

    if (!ctor) {
      throw new Error('ctor is null or undefined');
    }

    const name = ctor.name;
    if (!this.cache[name]) {
      this.cache[name] = new RepositoryInstance<TModel>(name, this.localStorage);
    }

    return this.cache[name];
  }
}
