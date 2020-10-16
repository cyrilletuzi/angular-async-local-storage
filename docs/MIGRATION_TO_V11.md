# Migration guide to version 11

## Requirements

First, be sure to:
- fully upgrade *all* your Angular packages (check with `ng version`)
- as stated in the official [Angular documentation](https://angular.io/guide/releases):

> If you are updating from one major version to another, then we recommend that you don't skip major versions. Follow the instructions to incrementally update to the next major version, testing and validating at each step. For example, if you want to update from version 9.x.x to version 11.x.x, we recommend that you update to the latest 10.x.x release first. After successfully updating to 10.x.x, you can then update to 11.x.x.

**So if you update from version < 9, please do the [other migrations](../MIGRATION.md) first**.
The version 9 migration is especially important, as a wrongly done migration could lead to
the loss of all previously stored data.

## How to update

Then:

```
ng update @ngx-pwa/local-storage
```

Done!

## More documentation

- [Full changelog for v11](../CHANGELOG.md)
- [Other migration guides](../MIGRATION.md)
- [Main documentation](../README.md)
