import { type, arch, platform, hostname, cpus, totalmem } from 'os';
import EventType from '../enums/event-type';
import IEvent from './event';
import { PackageManager, Package } from '../package-manager';
import { join } from 'path';
import { KeyValuePair } from '../types/key-value-pair';

const PACKAGE_FILE_NAME = 'package.json';

export default class AgentLoginEvent implements IEvent {
  public eventType = EventType.AGENT_LOG_IN;
  public ts: number;
  public package: {
    name: string;
    description: string;
    version: string;
    dependencies: Array<KeyValuePair>;
    dependenciesHash: string;
  };
  public appName: string;
  public env: string;
  public process: {
    pid: number;
    name: string;
    cwd: string;
  };
  public runtime: {
    type: string;
    version: string;
  };
  public os: {
    hostId: string;
    hostname: string;
    arch: string;
    type: string;
    platform: string;
    cpus: number;
    totalMemory: number;
  };
  public framework: {
    type: string;
    version: string;
  };
  public agent: {
    type: string;
    version: string;
    path: string;
  };

  constructor(hostId: string, framework: string, frameworkVersion: string, appName: string) {
    const appPkg: Package = PackageManager.getPackage(join(process.cwd(), PACKAGE_FILE_NAME));
    const agentPkg: Package = PackageManager.getPackage(join(process.cwd(), '/node_modules/@securenative/sdk/', PACKAGE_FILE_NAME));

    this.package = {
      name: appPkg.name,
      description: appPkg.description,
      version: appPkg.version,
      dependencies: appPkg.dependencies,
      dependenciesHash: appPkg.dependenciesHash
    };

    this.appName = appName;
    this.env = process.env.NODE_ENV;
    this.process = {
      pid: process.pid,
      name: process.title,
      cwd: process.cwd()
    };

    this.runtime = {
      type: 'node.js',
      version: process.version,
    };

    this.os = {
      hostId: hostId,
      hostname: hostname(),
      arch: arch(),
      type: type(),
      platform: platform().toString(),
      cpus: cpus().length,
      totalMemory: totalmem()
    };

    this.framework = {
      type: framework,
      version: frameworkVersion
    };

    this.agent = {
      type: "Server Agent",
      version: agentPkg.version,
      path: __dirname
    };

    this.ts = Date.now();
  }
}
