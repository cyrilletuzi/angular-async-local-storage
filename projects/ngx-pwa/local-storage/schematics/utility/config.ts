import { getPackageJsonDependency } from '@schematics/angular/utility/dependencies';
import { Tree, SchematicsException } from '@angular-devkit/schematics';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import { getWorkspace as getWorkspaceConfig } from '@schematics/angular/utility/config';

export const packageName = '@ngx-pwa/local-storage';
export const packageVersionLatest = '^8.0.0';

export function getAngularMajorVersion(host: Tree): number {

  const angularDependency = getPackageJsonDependency(host, '@angular/core');

  if (angularDependency === null) {
    throw new SchematicsException(`@angular/core is required to install ${packageName}`);
  }

  return Number.parseInt(angularDependency.version.replace('~', '').replace('^', '').substr(0, 1), 10);

}

export async function getAllMainPaths(host: Tree): Promise<string[]> {

  const mainPaths: string[] = [];

  const workspace = await getWorkspace(host);
  workspace.projects.forEach((project) => {
    if (project.extensions.projectType === 'application') {
      const buildTarget = project.targets.get('build');
      if (!buildTarget || !buildTarget.options || !buildTarget.options.main) {
        throw new SchematicsException(`Your angular.json project config is broken, can't find 'architect.build.options.main'`);
      }
      mainPaths.push(buildTarget.options.main as string);
    }
  });

  return mainPaths;

}

export async function getMainPath(host: Tree, userProject?: string): Promise<string> {

  const workspace = await getWorkspace(host);
  const workspaceConfig = getWorkspaceConfig(host);
  const projectName = userProject || workspaceConfig.defaultProject || '';
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

  const buildTarget = project.targets.get('build');
  if (!buildTarget || !buildTarget.options || !buildTarget.options.main) {
    throw new SchematicsException(`Your angular.json project config is broken, can't find 'architect.build.options.main'`);
  }
  return buildTarget.options.main as string;

}
