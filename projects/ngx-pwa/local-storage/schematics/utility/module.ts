import { Rule, Tree, SchematicsException } from '@angular-devkit/schematics';
import { addImportToModule } from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';
import { getAppModulePath } from '@schematics/angular/utility/ng-ast-utils';
import * as ts from 'typescript';

import { packageName } from './config';

function getAppModule(host: Tree, mainPath: string): { appModulePath: string; appModuleFile: string; } {

  const appModulePath = getAppModulePath(host, mainPath);

  if (!host.exists(appModulePath)) {
    throw new SchematicsException(`Can't find AppModule`);
  }

  const appModuleFile = (host.read(appModulePath) as Buffer).toString('utf-8');

  return { appModulePath, appModuleFile };

}

function updateAppModule(host: Tree, appModulePath: string, appModuleFile: string, storageModuleName: string): void {
  const appModuleSource = ts.createSourceFile(appModulePath, appModuleFile, ts.ScriptTarget.Latest, true);

  const appModuleChanges = addImportToModule(appModuleSource, appModulePath, storageModuleName, packageName) as InsertChange[];

  const recorder = host.beginUpdate(appModulePath);
  appModuleChanges.forEach((change) => {
    recorder.insertLeft(change.pos, change.toAdd);
  });
  host.commitUpdate(recorder);
}

export function addModule(angularMajorVersion: number, mainPath: string): Rule {
  return (host: Tree) => {

    if (angularMajorVersion >= 8) {

      const storageModuleName = `StorageModule.forRoot({ IDBNoWrap: true })`;
      const { appModulePath, appModuleFile } = getAppModule(host, mainPath);

      if (appModuleFile.includes('StorageModule')) {
        throw new SchematicsException(`This project already uses StorageModule, please use 'ng update ${packageName}' instead`);
      }

      updateAppModule(host, appModulePath, appModuleFile, storageModuleName);

    }

    return host;

  };
}

export function updateModule(angularMajorVersion: number, mainPath: string): Rule {
  return (host: Tree) => {

    if (angularMajorVersion >= 8) {

      const { appModulePath, appModuleFile } = getAppModule(host, mainPath);

      /* If `IDBNoWrap` is already set, nothing to do */
      if (!appModuleFile.includes('IDBNoWrap')) {

        if (appModuleFile.includes(packageName)) {

          const updatedAppModuleFile =
            appModuleFile.replace(/StorageModule.forRoot\({(.*)}\)/s, 'StorageModule.forRoot({ IDBNoWrap: false,$1 })');

          if (updatedAppModuleFile === appModuleFile) {
            throw new SchematicsException(`We couldn't update AppModule automatically, please check documentation for manual upgrade`);
          }

          host.overwrite(appModulePath, updatedAppModuleFile);

        } else {
          const storageModuleName = `StorageModule.forRoot({ IDBNoWrap: false })`;
          updateAppModule(host, appModulePath, appModuleFile, storageModuleName);
        }

      }

    }

    return host;

  };
}
