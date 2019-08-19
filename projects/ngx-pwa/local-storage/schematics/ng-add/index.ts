import { Rule, SchematicContext, Tree, SchematicsException, chain } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { addImportToModule } from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';
import { addPackageJsonDependency, NodeDependencyType, getPackageJsonDependency } from '@schematics/angular/utility/dependencies';
import { getAppModulePath } from '@schematics/angular/utility/ng-ast-utils';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import { getWorkspace as getWorkspaceConfig } from '@schematics/angular/utility/config';
import * as ts from 'typescript';

import { Schema as StorageAddOptions } from './schema';

const packageName = '@ngx-pwa/local-storage';
const packageVersionLatest = '^8.0.0';

function addDependency(angularMajorVersion: number): Rule {
  return (host: Tree) => {

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

function addModule(mainPath: string, angularMajorVersion: number): Rule {
  return (host: Tree) => {

    if (angularMajorVersion >= 8) {

      const storageModuleName = `StorageModule.forRoot({ IDBNoWrap: true })`;
      const appModulePath = getAppModulePath(host, mainPath);

      if (!host.exists(appModulePath)) {
        throw new SchematicsException(`Can't find AppModule`);
      }

      const appModuleFile = (host.read(appModulePath) as Buffer).toString('utf-8');

      if (appModuleFile.includes('StorageModule')) {
        throw new SchematicsException(`This project already uses StorageModule, please use 'ng update ${packageName}' instead`);
      }

      const appModuleSource = ts.createSourceFile(appModulePath, appModuleFile, ts.ScriptTarget.Latest, true);

      const appModuleChanges = addImportToModule(appModuleSource, appModulePath, storageModuleName, packageName) as InsertChange[];

      const recorder = host.beginUpdate(appModulePath);
      appModuleChanges.forEach((change) => {
        recorder.insertLeft(change.pos, change.toAdd);
      });
      host.commitUpdate(recorder);

    }

    return host;

  };
}

export default function ngAdd(options: StorageAddOptions): Rule {
  return async (host: Tree, context: SchematicContext) => {

    /* Get project */
    const workspace = await getWorkspace(host);
    const workspaceConfig = getWorkspaceConfig(host);
    const projectName = options.project || workspaceConfig.defaultProject || '';
    const project = workspace.projects.get(projectName);
    if (options.project && !project) {
      throw new SchematicsException(`Invalid project name '${options.project}'`);
    }
    if (!project) {
      throw new SchematicsException(`Can't find a default project, try 'ng add ${packageName} --project yourprojectname'`);
    }
    if (project.extensions.projectType !== 'application') {
      throw new SchematicsException(`'ng add ${packageName}' can only be used for projects with 'projectType': 'application'`);
    }

    const buildTarget = project.targets.get('build');
    if (!buildTarget || !buildTarget.options || !buildTarget.options.main) {
      throw new SchematicsException(`Your angular.json project config is broken, can't find 'architect.build.options.main'`);
    }
    const mainPath = buildTarget.options.main as string;

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
      addModule(mainPath, angularMajorVersion),
    ]);

  };
}
