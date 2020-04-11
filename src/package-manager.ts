import { readFileSync } from 'fs';
import { Logger } from './logger';
import { KeyValuePair } from './types/key-value-pair';
import { calculateHash } from './utils/utils';

export class Package {
  name: string;
  version: string;
  description: string;
  dependencies: Array<KeyValuePair>;
  dependenciesHash: string;
}

export class PackageManager {
  private static readPackageFile(filePath: string): Object {
    try {
      const content = readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      Logger.error(`Failed to parse ${filePath}`)
    }

    return null;
  }

  private static parsePackageFile(pkg: any): Package {
    const dependencies: Array<KeyValuePair> = Object.keys(pkg.dependencies).map((d) => {
      return { key: d, value: pkg.dependencies[d] }
    });

    const deps = dependencies.map(d => `${d.key}:${d.value}`).join(',');
    const dependenciesHash = calculateHash(deps);

    return {
      name: pkg.name,
      version: pkg.version,
      description: pkg.description,
      dependencies,
      dependenciesHash
    }
  }

  public static getPackage(packageFilePath: string): Package {
    const pkg = this.readPackageFile(packageFilePath);
    return pkg && this.parsePackageFile(pkg) || null;
  }
}
