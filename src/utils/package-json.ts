import path from 'node:path';

import fs from 'fs-extra';

export const addWorkspaceDependencies = async (
  packagePath: string,
  dependencies: Record<string, string>,
) => {
  const pkgJsonPath = path.join(packagePath, 'package.json');
  if (!(await fs.pathExists(pkgJsonPath))) {
    return;
  }

  const pkgJson = (await fs.readJson(pkgJsonPath)) as {
    dependencies?: Record<string, string>;
    [key: string]: unknown;
  };
  pkgJson.dependencies = pkgJson.dependencies ?? {};

  for (const [name, version] of Object.entries(dependencies)) {
    pkgJson.dependencies[name] = version;
  }

  await fs.writeJson(pkgJsonPath, pkgJson, { spaces: 2 });
};

export const getPackageInfo = async (packagePath: string) => {
  const pkgJsonPath = path.join(packagePath, 'package.json');
  if (!(await fs.pathExists(pkgJsonPath))) {
    return null;
  }
  return (await fs.readJson(pkgJsonPath)) as {
    name: string;
    [key: string]: unknown;
  };
};
