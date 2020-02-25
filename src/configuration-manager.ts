import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { SecureNativeOptions } from './types/securenative-options';
import { Logger } from './logger';
import { toNumber, toBoolean } from './utils/utils';

const CONFIG_FILE = 'securenative.json';

const configMap: Object = {
  'SECURENATIVE_API_KEY': 'apiKey',
  'SECURENATIVE_APP_NAME': 'appName',
  'SECURENATIVE_API_URL': 'apiUrl',
  'SECURENATIVE_INTERVAL': 'interval',
  'SECURENATIVE_HEARTBEAT_INTERVAL': 'heartBeatInterval',
  'SECURENATIVE_MAX_EVENTS': 'maxEvents',
  'SECURENATIVE_TIMEOUT': 'timeout',
  'SECURENATIVE_AUTO_SEND': 'autoSend',
  'SECURENATIVE_DISABLE': 'disable',
  'SECURENATIVE_DEBUG_MODE': 'debugMode'
}

export default class ConfigurationManager {
  private static config: SecureNativeOptions = null;

  static readConfigFile(configFilePath = join(process.cwd(), CONFIG_FILE)): SecureNativeOptions {
    Logger.debug(`Reading ${CONFIG_FILE}`);
    if (existsSync(configFilePath)) {
      const content = readFileSync(configFilePath, 'utf-8');

      try {
        const config = JSON.parse(content);
        const validConfigValues: any = Object.entries(config).filter(([key, val]) => configMap.hasOwnProperty(key)).map(([key, val]) => [configMap[key], val]);
        return validConfigValues.reduce((obj, [k, v]) => Object.assign(obj, { [k]: v }), {});

      } catch (e) {
        Logger.debug(`Unable to parse ${CONFIG_FILE}`);
      }
    }

    return null;
  }

  static setConfigKey(key: string, val: any) {
    this.config[key] = val;
  }

  static getConfig(): SecureNativeOptions {
    if (!this.config) {
      const fileConfig = this.readConfigFile() || {};

      this.config = {
        apiKey: fileConfig['apiKey'] || process.env.SECURENATIVE_API_KEY || null,
        appName: fileConfig['appName'] || process.env.SECURENATIVE_APP_NAME || '',
        apiUrl: fileConfig['apiUrl'] || process.env.SECURENATIVE_API_URL || 'https://api.securenative.com/collector/api/v1',
        interval: fileConfig['interval'] || toNumber(process.env.SECURENATIVE_INTERVAL, 1000),
        heartBeatInterval: fileConfig['heartBeatInterval'] || toNumber(process.env.SECURENATIVE_HEARTBEAT_INTERVAL, 60 * 5 * 1000),
        maxEvents: fileConfig['maxEvents'] || toNumber(process.env.SECURENATIVE_MAX_EVENTS, 1000),
        timeout: fileConfig['timeout'] || toNumber(process.env.SECURENATIVE_TIMEOUT, 1500),
        autoSend: fileConfig['autoSend'] || toBoolean(process.env.SECURENATIVE_AUTO_SEND, true),
        disable: fileConfig['disable'] || toBoolean(process.env.SECURENATIVE_DISABLE, false),
        debugMode: fileConfig['debugMode'] || toBoolean(process.env.SECURENATIVE_DEBUG_MODE, false),
        minSupportedVersion: '4.9.1',
      };
    }
    return this.config;
  }
}
