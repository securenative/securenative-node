import ConfigurationManager from "./configuration-manager";
import SecureNative from "./securenative";
import EventTypes from './event-types';
import { Logger } from "./logger";
import { compareVersions } from './utils/utils';
import { Package, PackageManager } from "./package-manager";
import { join } from "path";
import ModuleManager from "./module-manager";

const PACKAGE_FILE_NAME = 'package.json';
const appPkg: Package = PackageManager.getPackage(join(process.cwd(), PACKAGE_FILE_NAME));
const config = ConfigurationManager.getConfig();

// set default app name
ConfigurationManager.setConfigKey('appName', appPkg.name);
const moduleManager = new ModuleManager(appPkg);
const secureNative = new SecureNative(moduleManager, config);

// init logger
Logger.initLogger(config);
Logger.debug("Loaded Configurations", JSON.stringify(config));

Logger.debug('Starting version compatibility check');
if (compareVersions(process.version, config.minSupportedVersion) < 0) {
  console.error(`This version of Node.js ${process.version} isn't supported by SecureNative, minimum required version is ${config.minSupportedVersion}`);
  console.error(`Visit our docs to find out more: https://docs.securenative.com/docs/integrations/sdk/#install-via-npm-javascript`);
} else {
  ['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException', 'SIGTERM'].forEach((eventType: any) => {
    process.on(eventType, (exitCode) => {
      Logger.debug('Received exit signal', exitCode);
      //cleanup
      secureNative.stopAgent().finally(() => process.exit());
    });
  });
  process.once('beforeExit', function () {
    secureNative.stopAgent().catch(() => { });
  });
  secureNative.startAgent().catch(() => { });
}

export {
  secureNative,
  EventTypes
};
