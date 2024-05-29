import { SchematicsException, Tree, chain, type Rule, type SchematicContext } from "@angular-devkit/schematics";
import { getAllMainPaths, getDependencyMajorVersion } from "../utility/config";
import { updateModule } from "../utility/module";

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

export function updateToV13(): Rule {
  return (host: Tree, context: SchematicContext) => {

    const rxjsMajorVersion = getDependencyMajorVersion("rxjs", host);

    if (rxjsMajorVersion === undefined) {
      context.logger.warn(`Not able to detect rxjs version. Be aware that rxjs version >= 7.4 is recommended for version 13 of this library.`);
    }

    if (rxjsMajorVersion !== undefined && (rxjsMajorVersion < 7)) {
      context.logger.warn(`rxjs should be updated to version >= 7.4. Support for rxjs version 6 is not guaranteed.`);
    }

    return host;

  };
}

export function updateToV15(): Rule {
  return (host: Tree, context: SchematicContext) => {

    const rxjsMajorVersion = getDependencyMajorVersion("rxjs", host);

    if (rxjsMajorVersion === undefined) {
      context.logger.warn(`Not able to detect rxjs version. Be aware that rxjs version >= 7.4 is required for version 15 of this lib, rxjs 6 is not supported.`);
    }

    if (rxjsMajorVersion !== undefined && (rxjsMajorVersion < 7)) {
      throw new SchematicsException("rxjs >= 7.4 is required for this lib, rxjs 6 is not supported.");
    }

    return host;

  };
}
