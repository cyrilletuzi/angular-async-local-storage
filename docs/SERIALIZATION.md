# Serialization guide

## JSON serialization

In most cases, this library uses `indexedDB` storage, which allows any value type.
But in special cases, like in Firefox / IE private mode, the library will fall back to `localStorage`,
where JSON serialization will happen.

Everything can be serialized (`JSON.stringify()`), but when you unserialize (`JSON.parse()`),
you'll only get a JSON, ie. a primitive type, an array or a *literal* object.

So if you store an instance of a specific class in `localStorage`, like `Map`, `Set` or `Blob`,
it won't throw but what you will get with `.setItem()` won't be a `Map`, `Set` or `Blob`, but just a literal object.

So, it's safer to **stick to JSON-compatible values**.

## Validation

Also, this library uses JSON schemas for validation, which can only describe JSON-compatible values.
So if you're storing special structures like `Map`, `Set` or `Blob`, you'll have to manage your own validation (which is possible but painful).

## Examples

Here are some examples of the recommended way to store special structures.

### Storing a `Map`

```typescript
const someMap = new Map<string, number>([['hello', 1], ['world', 2]]);

/* Writing */
this.localStorage.setItem('test', Array.from(someMap)).subscribe();

/* Reading */
const schema: JSONSchema = {
  type: 'array',
  items: {
    type: 'array',
    items: [
      { type: 'string' },
      { type: 'number' },
    ],
  },
};

this.localStorage.getItem<[string, number][]>('test', schema).pipe(
  map((data) => new Map(data)),
).subscribe((data) => {
  data.get('hello'); // 1
});
```

### Storing a `Set`

```typescript
const someSet = new Set<string>(['hello', 'world']);

/* Writing */
this.localStorage.setItem('test', Array.from(someSet)).subscribe();

/* Reading */
const schema: JSONSchema = {
  type: 'array',
  items: { type: 'string' },
};

this.localStorage.getItem('test', schema).pipe(
  map((data) => new Set(data)),
).subscribe((data) => {
  data.has('hello'); // true
});
```

[Back to general documentation](../README.md)
