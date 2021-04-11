import { Rule, SchematicContext, Tree, chain, SchematicsException } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

import { Schema as StorageAddOptions } from './schema';
import { getAngularMajorVersion } from '../utility/config';

export default function(_: StorageAddOptions): Rule {
  return (host: Tree, context: SchematicContext) => {

    /* Get config */
    const angularMajorVersion = getAngularMajorVersion(host);

    if (angularMajorVersion <= 8) {
      throw new SchematicsException('Angular versions <= 8 are no longer supported.');
    }

    /* Task to run `npm install` (or user package manager) */
    context.addTask(new NodePackageInstallTask());

    return chain([]);

  };
}
