import fetch from 'node-fetch';
import ConfigurationManager from "./configuration-manager";
import SecureNative from "./securenative";
import EventType from './enums/event-type';
import { Logger } from "./logger";
import { compareVersions } from './utils/utils';
import { Package, PackageManager } from "./package-manager";
import { join } from "path";
import EventManager from "./event-manager";
import { contextFromRequest } from './utils/utils';

const PACKAGE_FILE_NAME = 'package.json';
const appPkg: Package = PackageManager.getPackage(join(process.cwd(), PACKAGE_FILE_NAME));
const config = ConfigurationManager.getConfig();

// set default app name
if (!config.appName) {
  ConfigurationManager.setConfigKey('appName', appPkg.name);
}

const eventManager = new EventManager(fetch, config);
const secureNative = new SecureNative(eventManager, config);

// init logger
Logger.initLogger(config);
Logger.debug("Loaded Configurations", JSON.stringify(config));

Logger.debug('Starting version compatibility check');

if (compareVersions(process.version, config.minSupportedVersion) < 0) {
  console.warn(`This version of Node.js ${process.version} isn't supported by SecureNative, minimum required version is ${config.minSupportedVersion}`);
  console.warn(`Visit our docs to find out more: https://docs.securenative.com/docs/integrations/sdk/#install-via-npm-javascript`);
}

export {
  contextFromRequest,
  secureNative,
  EventType as EventTypes
};
