import { Rule, Tree, chain } from '@angular-devkit/schematics';

import { getAngularMajorVersion, getAllMainPaths } from '../utility/config';
import { updateModule } from '../utility/module';

export function updateToV8(): Rule {
  return async (host: Tree) => {

    /* Get config */
    const angularMajorVersion = getAngularMajorVersion(host);
    const mainPaths = await getAllMainPaths(host);

    return chain(mainPaths.map((mainPath) => updateModule(angularMajorVersion, mainPath)));

  };
}
