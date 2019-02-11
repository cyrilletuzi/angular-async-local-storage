import * as ts from 'typescript';
import { Tree, SchematicContext, chain, Rule, SchematicsException } from '@angular-devkit/schematics';

import { addSymbolToNgModuleMetadata, isImported, insertImport } from '../utils/ast-utils';
import { InsertChange } from '../utils/change';

export default function (): Rule {

  return (_: Tree, __: SchematicContext) => {

    return chain([
      updateAppModule(),
    ]);

  };

}

function updateAppModule(): Rule {

  return (host: Tree, _: SchematicContext) => {

    // TODO: scan all projects in angular.json config
    const appModulePath = 'src/app/app.module.ts';

    const appModuleBuffer = host.read(appModulePath);

    if (!appModuleBuffer) {
      // TODO: add link to github doc
      throw new SchematicsException(`Couldn't find src/app/app.module.ts. You need to upgrade manually.`);
    }

    const appModuleSource = ts.createSourceFile(appModulePath, appModuleBuffer.toString(), ts.ScriptTarget.Latest, true);

    /* Add import */
    const importFunction = 'localStorageProviders';
    const importPath = '@ngx-pwa/local-storage';
    if (!isImported(appModuleSource, importFunction, importPath)) {
      const change = insertImport(appModuleSource, appModulePath, importFunction, importPath) as InsertChange;
      if (change) {
        const recorder = host.beginUpdate(appModulePath);
        recorder.insertLeft(change.pos, change.toAdd);
        host.commitUpdate(recorder);
      }
    }

    /* Add provider in `AppModule` */
    const providerText = `localStorageProviders({ compatibilityPriorToV8: true })`;
    // TODO: Avoid duplication of localStorageProviders if already present
    const metadataChanges = addSymbolToNgModuleMetadata(appModuleSource, appModulePath, 'providers', providerText) as InsertChange[];
    if (metadataChanges.length > 0) {
      const recorder = host.beginUpdate(appModulePath);
      metadataChanges.forEach((change) => {
        recorder.insertRight(change.pos, change.toAdd);
      });
      host.commitUpdate(recorder);
    }

    return host;

  };

}
