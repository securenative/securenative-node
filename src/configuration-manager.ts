import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { SecureNativeOptions } from './securenative-options';
import { Logger } from './logger';
import { toNumber, toBoolean } from './utils';

const CONFIG_FILE = 'securenative.json';

const DEFAULT_CONFIG: SecureNativeOptions = {
  apiKey: process.env.SECURENATIVE_API_KEY || null,
  appName: process.env.SECURENATIVE_APP_NAME || '',
  apiUrl: process.env.SECURENATIVE_API_URL || 'https://api.securenative.com/collector/api/v1',
  interval: toNumber(process.env.SECURENATIVE_INTERVAL, 1000),
  maxEvents: toNumber(process.env.SECURENATIVE_MAX_EVENTS, 1000),
  timeout: toNumber(process.env.SECURENATIVE_TIMEOUT, 1500),
  autoSend: toBoolean(process.env.SECURENATIVE_AUTO_SEND, true),
  disable: toBoolean(process.env.SECURENATIVE_DISABLE, false),
  debugMode: toBoolean(process.env.SECURENATIVE_DEBUG_MODE, false),
  minSupportedVersion: '4.9.1',
};

export default class ConfigurationManager {
  private static config: SecureNativeOptions = null;

  static readConfigFile(configFilePath = join(process.cwd(), CONFIG_FILE)): SecureNativeOptions {
    Logger.debug(`Reading ${CONFIG_FILE}`);
    if (existsSync(configFilePath)) {
      const content = readFileSync(configFilePath, 'utf-8');

      try {
        return JSON.parse(content);
      } catch (e) {
        Logger.debug(`Unable to parse ${CONFIG_FILE}`);
      }
    }

    return DEFAULT_CONFIG;
  }

  static setConfigKey(key: string, val: any) {
    this.config[key] = val;
  }

  static getConfig(): SecureNativeOptions {
    if (!this.config) {
      const fileConfig = this.readConfigFile();
      this.config = Object.assign({}, fileConfig, DEFAULT_CONFIG);
    }
    return this.config;
  }
}
