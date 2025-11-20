import { SchematicsException, Tree, chain, type Rule, type SchematicContext } from "@angular-devkit/schematics";
import { NodePackageInstallTask } from "@angular-devkit/schematics/tasks";
import { getDependencyMajorVersion } from "../utility/config";

export default function (): Rule {
  return (host: Tree, context: SchematicContext) => {

    /* Get config */
    const angularMajorVersion = getDependencyMajorVersion("@angular/core", host);

    if (angularMajorVersion === undefined) {
      context.logger.warn(`Not able to detect @angular/core version. Be aware that Angular versions <= 18 are no longer supported.`);
    }

    if (angularMajorVersion !== undefined && (angularMajorVersion <= 18)) {
      throw new SchematicsException("Angular versions <= 18 are no longer supported.");
    }

    const rxjsMajorVersion = getDependencyMajorVersion("rxjs", host);

    if (rxjsMajorVersion === undefined) {
      context.logger.warn(`Not able to detect rxjs version. Be aware that rxjs version >= 7.6 is required, rxjs 6 is not supported.`);
    }

    if (rxjsMajorVersion !== undefined && (rxjsMajorVersion < 7)) {
      throw new SchematicsException("rxjs >= 7.6 is required for this lib, rxjs 6 is not supported.");
    }

    /* Task to run `npm install` (or user package manager) */
    context.addTask(new NodePackageInstallTask());

    return chain([]);

  };
}
