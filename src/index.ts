import fetch from 'node-fetch';
import ConfigurationManager from "./configuration-manager";
import SecureNative from "./securenative";
import EventType from './enums/event-type';
import { Logger } from "./logger";
import { compareVersions } from './utils/utils';
import { Package, PackageManager } from "./package-manager";
import { join } from "path";
import ModuleManager from "./module-manager";
import { getHostIdSync } from "./utils/host-utils";
import EventManager from "./event-manager";

const PACKAGE_FILE_NAME = 'package.json';
const appPkg: Package = PackageManager.getPackage(join(process.cwd(), PACKAGE_FILE_NAME));
const config = ConfigurationManager.getConfig();
const hostId = getHostIdSync();

// set default app name
if (!config.appName) {
  ConfigurationManager.setConfigKey('appName', appPkg.name);
}

ConfigurationManager.setConfigKey('hostId', hostId);

const moduleManager = new ModuleManager(appPkg);
const eventManager = new EventManager(fetch, config);
const secureNative = new SecureNative(moduleManager, eventManager, config);

// init logger
Logger.initLogger(config);
Logger.debug("Loaded Configurations", JSON.stringify(config));

Logger.debug('Starting version compatibility check');
if (compareVersions(process.version, config.minSupportedVersion) < 0) {
  console.error(`This version of Node.js ${process.version} isn't supported by SecureNative, minimum required version is ${config.minSupportedVersion}`);
  console.error(`Visit our docs to find out more: https://docs.securenative.com/docs/integrations/sdk/#install-via-npm-javascript`);
} else {
  ['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'SIGTERM'].forEach((eventType: any) => {
    process.on(eventType, (exitCode) => {
      Logger.debug('Received exit signal', exitCode);
      //cleanup
      secureNative.agent.stopAgent().finally(() => process.exit());
    });
  });
  process.once('beforeExit', function () {
    secureNative.agent.stopAgent().catch(() => { });
  });
  secureNative.agent.startAgent().catch(() => { });
}

const SDK = secureNative.sdk;

export {
  SDK as secureNative,
  EventType as EventTypes
};
