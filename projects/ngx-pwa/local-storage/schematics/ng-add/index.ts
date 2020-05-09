import { Rule, SchematicContext, Tree, chain, SchematicsException } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

import { Schema as StorageAddOptions } from './schema';
import { getAngularMajorVersion, getMainPath } from '../utility/config';
import { addModule } from '../utility/module';

export default function(options: StorageAddOptions): Rule {
  return async (host: Tree, context: SchematicContext) => {

    /* Get config */
    const angularMajorVersion = getAngularMajorVersion(host);
    const mainPath = await getMainPath(host, options.project);

    if (angularMajorVersion <= 7) {
      throw new SchematicsException('Angular versions <= 7 are no longer supported.');
    }

    /* Task to run `npm install` (or user package manager) */
    context.addTask(new NodePackageInstallTask());

    return chain([
      addModule(angularMajorVersion, mainPath),
    ]);

  };
}
