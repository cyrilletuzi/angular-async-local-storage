import { Tree, SchematicsException } from '@angular-devkit/schematics';
import { getPackageJsonDependency } from '@schematics/angular/utility/dependencies';
import { getWorkspace } from '@schematics/angular/utility/workspace';

export const packageName = '@ngx-pwa/local-storage';

export function getAngularMajorVersion(host: Tree): number {

  const angularDependency = getPackageJsonDependency(host, '@angular/core');

  /* Throw if Angular is not installed */
  if (angularDependency === null) {
    throw new SchematicsException(`@angular/core is required to install ${packageName}`);
  }

  /* Remove semver signs if present and keep only the first number (major) */
  return Number.parseInt(angularDependency.version.replace('~', '').replace('^', '').split('.')[0], 10);

}

export async function getAllMainPaths(host: Tree): Promise<string[]> {

  const mainPaths: string[] = [];
  const workspace = await getWorkspace(host);

  /* Loop on all projects configured in angular.json */
  workspace.projects.forEach((project) => {

    /* The schematic only work with applications (not librairies) */
    if (project.extensions.projectType === 'application') {

      /* Get `main` option in angular.json project config */
      const buildTarget = project.targets.get('build');
      const e2eTarget = project.targets.get('e2e');

      if (buildTarget) {

        if (!buildTarget.options || !buildTarget.options.main) {
          throw new SchematicsException(`angular.json config is broken, can't find 'architect.build.options.main' in one or more projects`);
        }
        mainPaths.push(buildTarget.options.main as string);

      } else if (!e2eTarget) {
        /* In old CLI projects, e2e where distinct applications project, we don't need to throw for them */
        throw new SchematicsException(`angular.json config is broken, can't find 'architect.build.options.main' in one or more projects`);
      }

    }

  });

  return mainPaths;

}

export async function getMainPath(host: Tree, userProject?: string): Promise<string> {

  const workspace = await getWorkspace(host);

  /* If no project name was provided, use the default project name */
  const projectName = userProject ?? ((workspace.projects.size === 1) ? Array.from(workspace.projects.keys())[0] : '');
  const project = workspace.projects.get(projectName);

  if (userProject && !project) {
    throw new SchematicsException(`Invalid project name '${projectName}'`);
  }
  if (!project) {
    throw new SchematicsException(`Can't find a default project, try 'ng add ${packageName} --project yourprojectname'`);
  }
  if (project.extensions.projectType !== 'application') {
    throw new SchematicsException(`'ng add ${packageName}' can only be used for projects with 'projectType': 'application'`);
  }

  /* Get `main` option in angular.json project config */
  const buildTarget = project.targets.get('build');
  if (!buildTarget || !buildTarget.options || !buildTarget.options.main) {
    throw new SchematicsException(`Your angular.json project config is broken, can't find 'architect.build.options.main'`);
  }

  return buildTarget.options.main as string;

}
