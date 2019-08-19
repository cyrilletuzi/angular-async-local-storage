import { Rule, SchematicContext, Tree, SchematicsException, chain } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { addImportToModule } from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';
import { addPackageJsonDependency, NodeDependencyType, getPackageJsonDependency } from '@schematics/angular/utility/dependencies';
import * as ts from 'typescript';

const packageName = '@ngx-pwa/local-storage';
const packageVersionLatest = '^8.0.0';

function addDependency(angularMajorVersion: number): Rule {
  return (host: Tree) => {

    /* Do not install twice */
    const currentDependency = getPackageJsonDependency(host, packageName);
    if (currentDependency !== null) {
      throw new SchematicsException(`${packageName} is already installed, please use ng update instead`);
    }

    /* Set lib version depending on Angular version */
    let packageVersion = packageVersionLatest;

    if (angularMajorVersion >= 2 && angularMajorVersion <= 5) {
      throw new SchematicsException('Angular versions < 6 are no longer supported.');
    } else if (angularMajorVersion === 6 || angularMajorVersion === 7) {
      packageVersion = '^6.0.0';
    }

    addPackageJsonDependency(host, {
      type: NodeDependencyType.Default,
      name: packageName,
      version: packageVersion,
    });

    return host;

  };
}

function addModule(angularMajorVersion: number): Rule {
  return (host: Tree) => {

    if (angularMajorVersion === 8) {

      const appModulePath = 'src/app/app.module.ts';
      const storageModuleName = `StorageModule.forRoot({ IDBNoWrap: true })`;

      if (!host.exists(appModulePath)) {
        throw new SchematicsException(`Can't find AppModule`);
      }

      const appModuleFile = (host.read(appModulePath) as Buffer).toString('utf-8');
      const appModuleSource = ts.createSourceFile(appModulePath, appModuleFile, ts.ScriptTarget.Latest, true);

      const appModuleChanges = addImportToModule(appModuleSource, appModulePath, storageModuleName, packageName);

      const recorder = host.beginUpdate(appModulePath);
      appModuleChanges.forEach(change => {
        if (change instanceof InsertChange) {
          recorder.insertLeft(change.pos, change.toAdd);
        }
      });
      host.commitUpdate(recorder);

    }

    return host;

  };
}

export default function ngAdd(): Rule {
  return (host: Tree, context: SchematicContext) => {

    /* Check Angular version */
    const angularDependency = getPackageJsonDependency(host, '@angular/core');
    if (angularDependency === null) {
      throw new SchematicsException(`@angular/core is required to install ${packageName}`);
    }
    const angularMajorVersion = Number.parseInt(angularDependency.version.replace('~', '').replace('^', '').substr(0, 1), 10);

    /* Task to run `npm install` (or else) */
    context.addTask(new NodePackageInstallTask());

    return chain([
      addDependency(angularMajorVersion),
      addModule(angularMajorVersion),
    ]);

  };
}
