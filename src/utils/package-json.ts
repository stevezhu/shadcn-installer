import path from 'node:path';

import fs from 'fs-extra';

export async function addWorkspaceDependencies(
  packagePath: string,
  dependencies: Record<string, string>,
) {
  const pkgJsonPath = path.join(packagePath, 'package.json');
  if (!(await fs.pathExists(pkgJsonPath))) {return;}

  const pkgJson = await fs.readJson(pkgJsonPath);
  pkgJson.dependencies = pkgJson.dependencies ?? {};

  for (const [name, version] of Object.entries(dependencies)) {
    pkgJson.dependencies[name] = version;
  }

  await fs.writeJson(pkgJsonPath, pkgJson, { spaces: 2 });
}

export async function getPackageInfo(packagePath: string) {
  const pkgJsonPath = path.join(packagePath, 'package.json');
  if (!(await fs.pathExists(pkgJsonPath))) {return null;}
  return  fs.readJson(pkgJsonPath);
}
