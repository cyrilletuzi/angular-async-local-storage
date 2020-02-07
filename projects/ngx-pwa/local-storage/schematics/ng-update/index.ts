import { Rule, Tree, chain } from '@angular-devkit/schematics';

import { getAllMainPaths } from '../utility/config';
import { updateModule } from '../utility/module';

export function updateToV8(): Rule {
  return async (host: Tree) => {

    /* Get config */
    const mainPaths = await getAllMainPaths(host);

    /* Update `AppModule` of all projects */
    return chain(mainPaths.map((mainPath) => updateModule(mainPath)));

  };
}

export function updateToV9(): Rule {
  return async (host: Tree) => {

    /* Get config */
    const mainPaths = await getAllMainPaths(host);

    /* Update `AppModule` of all projects */
    return chain(mainPaths.map((mainPath) => updateModule(mainPath)));

  };
}
