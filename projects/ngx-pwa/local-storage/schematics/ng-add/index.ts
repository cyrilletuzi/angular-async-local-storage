import { Rule, SchematicContext, Tree, chain } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

import { Schema as StorageAddOptions } from './schema';
import { getAngularMajorVersion, getMainPath } from '../utility/config';
import { addModule } from '../utility/module';
import { addDependency } from '../utility/dependency';

export default function(options: StorageAddOptions): Rule {
  return async (host: Tree, context: SchematicContext) => {

    /* Get config */
    const angularMajorVersion = getAngularMajorVersion(host);
    const mainPath = await getMainPath(host, options.project);

    /* Task to run `npm install` (or else) */
    context.addTask(new NodePackageInstallTask());

    return chain([
      addDependency(angularMajorVersion),
      addModule(angularMajorVersion, mainPath),
    ]);

  };
}
