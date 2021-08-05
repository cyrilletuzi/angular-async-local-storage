import { Rule, SchematicContext, Tree, chain, SchematicsException } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

import { getAngularMajorVersion } from '../utility/config';

export default function(): Rule {
  return (host: Tree, context: SchematicContext) => {

    /* Get config */
    const angularMajorVersion = getAngularMajorVersion(host);

    if (angularMajorVersion <= 9) {
      throw new SchematicsException('Angular versions <= 9 are no longer supported.');
    }

    /* Task to run `npm install` (or user package manager) */
    context.addTask(new NodePackageInstallTask());

    return chain([]);

  };
}
