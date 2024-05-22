import { SchematicsException, Tree, chain, type Rule, type SchematicContext } from "@angular-devkit/schematics";
import { NodePackageInstallTask } from "@angular-devkit/schematics/tasks";
import { getDependencyMajorVersion } from "../utility/config";

export default function (): Rule {
  return (host: Tree, context: SchematicContext) => {

    /* Get config */
    const angularMajorVersion = getDependencyMajorVersion("@angular/core", host);

    if (!angularMajorVersion) {
      context.logger.warn(`Not able to detect @angular/core version. Be aware that Angular versions <= 14 are no longer supported.`);
    }

    if (angularMajorVersion && (angularMajorVersion <= 15)) {
      throw new SchematicsException("Angular versions <= 15 are no longer supported.");
    }

    const rxjsMajorVersion = getDependencyMajorVersion("rxjs", host);

    if (!rxjsMajorVersion) {
      context.logger.warn(`Not able to detect rxjs version. Be aware that rxjs version >= 7.4 is recommended for Angular 14 and required for Angular >= 15.`);
    }

    if (rxjsMajorVersion && (rxjsMajorVersion < 7)) {
      throw new SchematicsException("rxjs >= 7.4 is required for this lib, rxjs 6 is not supported.");
    }

    /* Task to run `npm install` (or user package manager) */
    context.addTask(new NodePackageInstallTask());

    return chain([]);

  };
}
