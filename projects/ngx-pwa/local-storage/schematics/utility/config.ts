import { Tree, SchematicsException } from '@angular-devkit/schematics';
import { getPackageJsonDependency } from '@schematics/angular/utility/dependencies';
import { getWorkspace } from '@schematics/angular/utility/workspace';

export const packageName = '@ngx-pwa/local-storage';

export function getDependencyMajorVersion(name: string, host: Tree): number | undefined {

  const dependency = getPackageJsonDependency(host, name);

  /* Throw if Angular is not installed */
  if (dependency === null) {
    return undefined;
  }

  /* Remove semver signs if present and keep only the first number (major) */
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return Number.parseInt(dependency.version.replace('~', '').replace('^', '').split('.')[0]!, 10);

}

export async function getAllMainPaths(host: Tree): Promise<string[]> {

  const mainPaths: string[] = [];
  const workspace = await getWorkspace(host);

  /* Loop on all projects configured in angular.json */
  workspace.projects.forEach((project) => {

    /* The schematic only work with applications (not librairies) */
    if (project.extensions['projectType'] === 'application') {

      /* Get `main` option in angular.json project config */
      const buildTarget = project.targets.get('build');
      const e2eTarget = project.targets.get('e2e');

      if (buildTarget) {

        if (!buildTarget.options || !buildTarget.options['main']) {
          throw new SchematicsException(`angular.json config is broken, can't find 'architect.build.options.main' in one or more projects`);
        }
        mainPaths.push(buildTarget.options['main'] as string);

      } else if (!e2eTarget) {
        /* In old CLI projects, e2e where distinct applications project, we don't need to throw for them */
        throw new SchematicsException(`angular.json config is broken, can't find 'architect.build.options.main' in one or more projects`);
      }

    }

  });

  return mainPaths;

}
