import { Rule, SchematicContext, Tree, chain, SchematicsException } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';

import { getDependencyMajorVersion } from '../utility/config';

export default function(): Rule {
  return (host: Tree, context: SchematicContext) => {

    /* Get config */
    const angularMajorVersion = getDependencyMajorVersion('@angular/core', host);

    if (!angularMajorVersion) {
      context.logger.warn(`Not able to detect @angular/core version. Be aware that Angular versions <= 10 are no longer supported.`);
    }

    if (angularMajorVersion && (angularMajorVersion <= 10)) {
      throw new SchematicsException('Angular versions <= 10 are no longer supported.');
    }

    const rxjsMajorVersion = getDependencyMajorVersion('rxjs', host);

    if (!rxjsMajorVersion) {
      context.logger.warn(`Not able to detect rxjs version. Be aware that rxjs version >= 7.4 is recommended for Angular >= 13.`);
    }

    if (angularMajorVersion && rxjsMajorVersion
      && (angularMajorVersion >= 13) && (rxjsMajorVersion < 7)) {
        context.logger.warn(`rxjs should be updated to version >= 7.4. Support for rxjs version 6 is not guaranteed.`);
    }

    /* Task to run `npm install` (or user package manager) */
    context.addTask(new NodePackageInstallTask());

    return chain([]);

  };
}
