import { map, mergeMap } from 'rxjs/operators';

import { AsyncLocalStorage } from '../lib.service';
import { Observable } from 'rxjs/Observable';
import { _throw } from 'rxjs/observable/throw';
import { of } from 'rxjs/observable/of';

export class RepositoryInstance<TModel> {

  constructor(
    public name: string,
    public localStorage: AsyncLocalStorage
  ) { }

  every(predicate: (item: TModel) => boolean): Observable<boolean> {
    if (!predicate) {
      return _throw(new Error('Predicate not defined'));
    }

    return this.localStorage.getItem<TModel[]>(this.name).pipe(map(items => {
      if (!items) {
        items = [];
      }

      return items.every(predicate);
    }));
  }

  everyAsync(predicate: (item: TModel) => boolean): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!predicate) {
        reject(new Error('Predicate not defined'));
        return;
      }

      this.localStorage.getItem<TModel[]>(this.name).subscribe(items => {
        if (!items) {
          items = [];
        }

        resolve(items.every(predicate));
      }, reject);
    });
  }

  some(predicate: (item: TModel) => boolean): Observable<boolean> {
    if (!predicate) {
      return _throw(new Error('Predicate not defined'));
    }

    return this.localStorage.getItem<TModel[]>(this.name).pipe(map(items => {
      if (!items) {
        items = [];
      }

      return items.some(predicate);
    }));
  }

  someAsync(predicate: (item: TModel) => boolean): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!predicate) {
        reject(new Error('Predicate not defined'));
        return;
      }

      this.localStorage.getItem<TModel[]>(this.name).subscribe(items => {
        if (!items) {
          items = [];
        }

        resolve(items.some(predicate));
      }, reject);
    });
  }

  find(predicate: (item: TModel) => boolean): Observable<TModel | undefined> {
    if (!predicate) {
      return _throw(new Error('Predicate not defined'));
    }

    return this.localStorage.getItem<TModel[]>(this.name).pipe(map(items => {
      if (!items) {
        return undefined;
      }

      return items.find(predicate);
    }));
  }

  findAsync(predicate: (item: TModel) => boolean): Promise<TModel | undefined> {
    return new Promise((resolve, reject) => {
      if (!predicate) {
        reject(new Error('Predicate not defined'));
        return;
      }

      this.localStorage.getItem<TModel[]>(this.name).subscribe(items => {
        if (!items) {
          resolve(undefined);
          return;
        }

        const item = items.find(predicate);
        resolve(item);
      }, reject);
    });
  }

  filter(predicate: (item: TModel) => boolean): Observable<TModel[]> {
    if (!predicate) {
      return _throw(new Error('Predicate not defined'));
    }

    return this.localStorage.getItem<TModel[]>(this.name).pipe(map(items => {
      if (!items) {
        return [];
      }

      return items.filter(predicate);
    }));
  }

  filterAsync(predicate: (item: TModel) => boolean): Promise<TModel[]> {
    return new Promise((resolve, reject) => {
      if (!predicate) {
        reject(new Error('Predicate not defined'));
        return;
      }

      this.localStorage.getItem<TModel[]>(this.name).subscribe(items => {
        if (!items) {
          resolve([]);
          return;
        }

        const result = items.filter(predicate);
        resolve(result);
      }, reject);
    });
  }

  getAll(): Observable<TModel[]> {
    return this.localStorage.getItem<TModel[]>(this.name).pipe(map(items => {
      if (!items) {
        return [];
      }

      return items;
    }));
  }

  getAllAsync(): Promise<TModel[]> {
    return new Promise((resolve, reject) => {
      this.localStorage.getItem<TModel[]>(this.name).subscribe(items => {
        if (!items) {
          resolve([]);
          return;
        }

        resolve(items);
      }, reject);
    });
  }

  addOne(item: TModel): Observable<TModel> {
    if (!item) {
      return _throw(new Error('Item not defined'));
    }

    return this.localStorage.getItem<TModel[]>(this.name).pipe(map(items => {
      if (!items) {
        items = [];
      }

      items.push(item);

      return items;
    }), mergeMap(result => this.localStorage.setItem(this.name, result).pipe(map(r => item))));
  }

  addOneAsync(item: TModel): Promise<TModel> {
    return new Promise((resolve, reject) => {
      if (!item) {
        reject(new Error('Item not defined'));
        return;
      }

      this.localStorage.getItem<TModel[]>(this.name).subscribe(items => {
        if (!items) {
          items = [];
        }

        items.push(item);
        this.localStorage.setItem(this.name, items).subscribe(() => {
          resolve(item);
        }, reject);
      }, reject);
    });
  }

  addMany(_items: TModel[]): Observable<TModel[]> {
    if (!_items || _items.length <= 0) {
      return _throw(new Error('Items not defined or empty'));
    }

    return this.localStorage.getItem<TModel[]>(this.name).pipe(map(items => {
      if (!items) {
        items = [];
      }
      items.push(..._items);

      return items;
    }), mergeMap(result => this.localStorage.setItem(this.name, result).pipe(map(r => _items))));
  }

  addManyAsync(_items: TModel[]): Promise<TModel[]> {
    return new Promise((resolve, reject) => {
      if (!_items || _items.length <= 0) {
        reject(new Error('Items not defined or empty'));
        return;
      }

      this.localStorage.getItem<TModel[]>(this.name).subscribe(items => {
        if (!items) {
          items = [];
        }

        items.push(..._items);
        this.localStorage.setItem(this.name, items).subscribe(() => {
          resolve(items!);
        }, reject);
      }, reject);
    });
  }

  removeOne(predicate: (item: TModel) => boolean): Observable<TModel | undefined> {
    if (!predicate) {
      return _throw(new Error('Predicate not defined'));
    }

    return this.localStorage.getItem<TModel[]>(this.name).pipe(map(items => {
      if (!items) {
        return undefined;
      }

      const item = items.find(predicate);
      if (!item) {
        return undefined;
      }

      const index = items.indexOf(item);
      const removedItem = items.splice(index, 1);
      return { items, removedItem };
    }), mergeMap(r => this.localStorage.setItem(this.name, r!.items).pipe(map(s => r!.removedItem[0]))));
  }

  removeOneAsync(predicate: (item: TModel) => boolean): Promise<TModel | undefined> {
    return new Promise((resolve, reject) => {
      if (!predicate) {
        reject(new Error('Predicate not defined'));
        return;
      }

      this.localStorage.getItem<TModel[]>(this.name).subscribe(items => {
        if (!items) {
          resolve(undefined);
          return;
        }

        const item = items.find(predicate)!;
        if (!item) {
          resolve(undefined);
        }

        const index = items.indexOf(item);
        const removedItem = items.splice(index, 1);
        this.localStorage.setItem(this.name, items).subscribe(() => {
          resolve(removedItem[0]);
        }, reject);
      }, reject);
    });
  }

  removeMany(predicate: (item: TModel) => boolean): Observable<TModel[] | undefined> {
    if (!predicate) {
      return _throw(new Error('Predicate not defined'));
    }

    return this.localStorage.getItem<TModel[]>(this.name).pipe(map(items => {
      if (!items) {
        return undefined;
      }

      const result = items.filter(predicate);
      if (!result) {
        return undefined;
      }

      const indexes = result.map((v, i) => i);
      const removedItems: TModel[] = [];
      indexes.reverse().forEach(i => {
        removedItems.push(result.splice(i, 1)[0]);
      });

      return { result, removedItems };
    }), mergeMap(r => this.localStorage.setItem(this.name, r!.result).pipe(map(ri => r!.removedItems))));
  }

  removeManyAsync(predicate: (item: TModel) => boolean): Promise<TModel[] | undefined> {
    return new Promise((resolve, reject) => {
      if (!predicate) {
        reject(new Error('Predicate not defined'));
        return;
      }

      this.localStorage.getItem<TModel[]>(this.name).subscribe(items => {
        if (!items) {
          resolve(undefined);
          return;
        }

        const result = items.filter(predicate);
        if (!result) {
          resolve(undefined);
        }

        const indexes = result.map((v, i) => i);
        const removedItems: TModel[] = [];
        indexes.reverse().forEach(i => {
          removedItems.push(result.splice(i, 1)[0]);
        });

        this.localStorage.setItem(this.name, result).subscribe(() => {
          resolve(removedItems);
        }, reject);
      }, reject);
    });
  }

  updateOne(predicate: (item: TModel) => boolean, item: TModel): Observable<TModel | undefined> {
    if (!predicate) {
      return _throw(new Error('Predicate not defined'));
    }

    if (!item) {
      return _throw(new Error('Item is undefined or null'));
    }

    return this.localStorage.getItem<TModel[]>(this.name).pipe(map(items => {
      if (!items) {
        return undefined;
      }

      const _item = items.find(predicate);
      if (!_item) {
        return undefined;
      }

      const _itemIndex = items.indexOf(_item);

      items[_itemIndex] = item;

      return { items, item };
    }), mergeMap(r => this.localStorage.setItem(this.name, r!.items).pipe(map(s => r!.item))));
  }

  updateOneAsync(predicate: (item: TModel) => boolean, item: TModel): Promise<TModel | undefined> {
    return new Promise((resolve, reject) => {
      if (!predicate) {
        reject(new Error('Predicate not defined'));
        return;
      }

      if (!item) {
        reject(new Error('Item is undefined or null'));
        return;
      }

      this.localStorage.getItem<TModel[]>(this.name).subscribe(items => {
        if (!items) {
          resolve(undefined);
          return;
        }

        const _item = items.find(predicate);

        if (!_item) {
          resolve(undefined);
          return;
        }

        const _itemIndex = items.indexOf(_item);

        items[_itemIndex] = item;

        this.localStorage.setItem(this.name, items).subscribe(() => {
          resolve(item);
        }, reject);
      }, reject);
    });
  }

  clear(): Observable<boolean> {
    return this.localStorage.clear().pipe(map(s => s));
  }

  clearAsync(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.localStorage.clear().subscribe(result => {
        resolve(result);
      }, reject);
    });
  }
}
