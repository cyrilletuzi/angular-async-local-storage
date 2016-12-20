# Changelog

## 1.2.0 (2016-12-20)

### Features

- Up to date with Angular 2.4 and RxJS final

## 1.1.1 (2016-12-19)

### Bug fixes

- Recompiled with Angular 2.3.1, following [Angular changelog advice](https://github.com/angular/angular/blob/master/CHANGELOG.md#231-2016-12-15)

## 1.1.0 (2016-12-09)

### Features

- Up to date with Angular 2.3
- Update peerDependencies :
  - reflect-metadata 0.1.8
  - rxjs 5.0.0-rc.4
  - zone.js 0.7.2

## 1.0.2 (2016-11-01)

### Bug fixes

- allow falsy values in mock database

## 1.0.1 (2016-11-01)

### Bug fixes

- null instead of undefined for unexisting item in mock database

## 1.0.0 (2016-10-31)

### Bug fixes

- Manage null values with IndexedDB

## 1.0.0-beta.2 (2016-10-31)

### Features

- Compatible with Universal server-side rendering
- IE9 support via native localStorage (public API still asynchronous but synchronous internally)

### Bug fixes

- Remove an unwanted console.log() call

## 1.0.0-beta.1 (2016-10-31)

### Features

- Initial release : asynchronous local storage module for Angular 2
- Up to date with Angular 2.1
- Compatible with AoT pre-compiling
