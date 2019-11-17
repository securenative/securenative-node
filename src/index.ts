import ConfigurationManager from "./configuration-manager";
import SecureNative from "./securenative";
import EventTypes from './event-types';
import { Logger } from "./logger";
import { compareVersions } from './utils';
import { Package, PackageManager } from "./package-manager";
import { join } from "path";
import ModuleManager from "./module-manager";

const PACKAGE_FILE_NAME = 'package.json';

const appPkg: Package = PackageManager.getPackage(join(process.cwd(), PACKAGE_FILE_NAME));
const config = ConfigurationManager.getConfig();
// set default app name
ConfigurationManager.setConfigKey('appName', appPkg.name);

const moduleManager = new ModuleManager(appPkg);

// init logger
Logger.initLogger(config);

Logger.debug('Starting version compatibility check')
if (compareVersions(process.version, config.minSupportedVersion) < 0) {
  console.error(`This version of Node.js ${process.version} isn't supported by SecureNative`);
  console.error(`Visit our docs to find out more: https://docs.securenative.com/docs/integrations/sdk/#install-via-npm-javascript`);
} else {
  const secureNative = new SecureNative(moduleManager, config);

  const exitHandler = (options, exitCode) => {
    secureNative.stopAgent();
  }

  process.stdin.resume();
  ['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException', 'SIGTERM'].forEach((eventType: any) => {
    process.on(eventType, exitHandler.bind(null, eventType));
  });
  process.once('beforeExit', function () {
    secureNative.stopAgent();
  });
  secureNative.startAgent().catch(() => { });
}

export {
  SecureNative,
  EventTypes
};
