import { Rule, Tree, SchematicsException } from '@angular-devkit/schematics';
import { addPackageJsonDependency, NodeDependencyType } from '@schematics/angular/utility/dependencies';

import { packageVersionLatest, packageName } from './config';

function manageDependency(angularMajorVersion: number, overwrite: boolean): Rule {
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
      overwrite,
    });

    return host;

  };
}

export function addDependency(angularMajorVersion: number) {
  return manageDependency(angularMajorVersion, false);
}

export function updateDependency(angularMajorVersion: number) {
  return manageDependency(angularMajorVersion, true);
}
