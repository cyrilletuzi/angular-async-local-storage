import { Rule, Tree, SchematicsException } from '@angular-devkit/schematics';
import { addPackageJsonDependency, NodeDependencyType } from '@schematics/angular/utility/dependencies';

import { packageVersionLatest, packageName, packageVersionLTS8, packageVersionLTS9 } from './config';

export function addDependency(angularMajorVersion: number): Rule {
  return (host: Tree) => {

    /* Set lib version depending on Angular version */
    let packageVersion = packageVersionLatest;

    /* Throw on unsupported versions */
    if (angularMajorVersion >= 2 && angularMajorVersion <= 7) {
      throw new SchematicsException('Angular versions <= 7 are no longer supported.');
    }
    /* Manage LTS versions */
    if (angularMajorVersion === 8) {
      packageVersion = packageVersionLTS8;
    } else if (angularMajorVersion === 9) {
      packageVersion = packageVersionLTS9;
    }

    addPackageJsonDependency(host, {
      /* Default = prod dependency */
      type: NodeDependencyType.Default,
      name: packageName,
      version: packageVersion,
      /* Angular CLI will have pre-installed the package to get the schematics,
       * so we need to overwrite to install the good versions */
      overwrite: true,
    });

    return host;

  };
}
