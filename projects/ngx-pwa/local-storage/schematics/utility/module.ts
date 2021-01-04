import { Rule, Tree, SchematicsException } from '@angular-devkit/schematics';
import { addImportToModule } from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';
import { getAppModulePath } from '@schematics/angular/utility/ng-ast-utils';
import { createSourceFile, ScriptTarget } from '@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript';

import { packageName } from './config';

/**
 * @param mainPath Path of the project `main.ts` file
 * @returns An object with `AppModule` path and source
 */
function getAppModule(host: Tree, mainPath: string): { appModulePath: string; appModuleFile: string; } {

  const appModulePath = getAppModulePath(host, mainPath);

  if (!host.exists(appModulePath)) {
    throw new SchematicsException(`Can't find AppModule`);
  }

  const appModuleFile = (host.read(appModulePath) as Buffer).toString('utf-8');

  return { appModulePath, appModuleFile };

}

function updateAppModule(host: Tree, appModulePath: string, appModuleFile: string, storageModuleName: string): void {

  /* Third param is to disable transpilation, 4rd note sure I just followed other official schematics */
  const appModuleSource = createSourceFile(appModulePath, appModuleFile, ScriptTarget.Latest, true);

  const appModuleChanges = addImportToModule(appModuleSource, appModulePath, storageModuleName, packageName) as InsertChange[];

  /* The changes must be applied, otherwise the previous line does nothing */
  const recorder = host.beginUpdate(appModulePath);
  appModuleChanges.forEach((change) => {
    recorder.insertLeft(change.pos, change.toAdd);
  });
  host.commitUpdate(recorder);

}

/**
 * @param mainPath Path of the project `main.ts` file
 */
export function addModule(angularMajorVersion: number, mainPath: string): Rule {
  return (host: Tree) => {

    /* Versions < 8 didn't have `StorageModule` and versions > 9 don't need it */
    if (angularMajorVersion === 8) {

      const { appModulePath, appModuleFile } = getAppModule(host, mainPath);
      /* New applications should have `IDBNoWrap` to `true` to be future-proof, as it will become the default */
      const storageModuleName = `StorageModule.forRoot({ IDBNoWrap: true })`;

      if (appModuleFile.includes(packageName)) {
        throw new SchematicsException(`This project already uses ${packageName}, please use 'ng update ${packageName}' instead`);
      }

      updateAppModule(host, appModulePath, appModuleFile, storageModuleName);

    }

    return host;

  };
}

/**
 * @param mainPath Path of the project `main.ts` file
 */
export function updateModule(mainPath: string): Rule {
  return (host: Tree) => {

    const { appModulePath, appModuleFile } = getAppModule(host, mainPath);

    /* If `IDBNoWrap` is already set, it **must not** be changed, otherwise previously stored data would be lost */
    if (!appModuleFile.includes('IDBNoWrap')) {

      if (appModuleFile.includes(packageName)) {

        /* It's important to keep the current options, otherwise previously stored data would be lost */
        const updatedAppModuleFile =
          appModuleFile.replace(/StorageModule.forRoot\({(.*)}\)/s, 'StorageModule.forRoot({ IDBNoWrap: false,$1 })');

        /* If the file is still the same, it means we didn't catch the module
          * (for example, it can happen if the user aliased `StorageModule`) */
        if (updatedAppModuleFile === appModuleFile) {
          // eslint-disable-next-line max-len
          throw new SchematicsException(`We couldn't update AppModule automatically. Be sure to follow the documentation to update manually, otherwise previsouly stored data could be lost.`);
        }

        host.overwrite(appModulePath, updatedAppModuleFile);

      } else {

        /* `IDBNoWrap` **must** be `false` in existing applications, otherwise previously stored data would be lost */
        const storageModuleName = `StorageModule.forRoot({ IDBNoWrap: false })`;
        updateAppModule(host, appModulePath, appModuleFile, storageModuleName);

      }

    }

    return host;

  };
}

/**
 * @param mainPath Path of the project `main.ts` file
 */
export function updateModuleToV9(mainPath: string): Rule {
  return (host: Tree) => {

    const { appModulePath, appModuleFile } = getAppModule(host, mainPath);

    /* If `IDBNoWrap` is already set, it **must not** be changed, otherwise previously stored data would be lost */
    if (!appModuleFile.includes('IDBNoWrap')) {

      if (appModuleFile.includes(packageName)) {

        /* It's important to keep the current options, otherwise previously stored data would be lost */
        const updatedAppModuleFile =
          appModuleFile.replace(/StorageModule.forRoot\({(.*)}\)/s, 'StorageModule.forRoot({ IDBNoWrap: false,$1 })');

        /* If the file is still the same, it means we didn't catch the module
          * (for example, it can happen if the user aliased `StorageModule`) */
        if (updatedAppModuleFile === appModuleFile) {
          throw new SchematicsException(`We couldn't update AppModule automatically, please check documentation for manual update`);
        }

        host.overwrite(appModulePath, updatedAppModuleFile);

      } else {

        /* `IDBNoWrap` **must** be `false` in existing applications, otherwise previously stored data would be lost */
        const storageModuleName = `StorageModule.forRoot({ IDBNoWrap: false })`;
        updateAppModule(host, appModulePath, appModuleFile, storageModuleName);

      }

    }

    return host;

  };
}
