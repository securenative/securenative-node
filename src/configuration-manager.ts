import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { SecureNativeOptions } from './types/securenative-options';
import { Logger } from './logger';
import { toArray, toNumber, toBoolean, toEnum, isEnum } from './utils/utils';
import FailoveStrategy from './enums/failover-strategy';

const CONFIG_FILE = 'securenative.json';

const configMap: Object = {
  SECURENATIVE_API_KEY: { name: 'apiKey', type: 'string' },
  SECURENATIVE_APP_NAME: { name: 'appName', type: 'string' },
  SECURENATIVE_API_URL: { name: 'apiUrl', type: 'string' },
  SECURENATIVE_INTERVAL: { name: 'interval', type: 'number' },
  SECURENATIVE_MAX_EVENTS: { name: 'maxEvents', type: 'number' },
  SECURENATIVE_TIMEOUT: { name: 'timeout', type: 'number' },
  SECURENATIVE_AUTO_SEND: { name: 'autoSend', type: 'boolean' },
  SECURENATIVE_DISABLE: { name: 'disable', type: 'boolean' },
  SECURENATIVE_LOG_LEVEL: { name: 'logLevel', type: 'string' },
  SECURENATIVE_FAILOVER_STRATEGY: { name: 'failoverStrategy', type: 'string' },
  SECURENATIVE_PROXY_HEADERS: { name: 'proxyHeaders', type: 'object' },
  SECURENATIVE_PII_HEADERS: { name: 'piiHeaders', type: 'object' },
  SECURENATIVE_PII_REGEX_PATTERN: { name: 'piiRegexPattern', type: 'object' },
};

export default class ConfigurationManager {
  private static config: SecureNativeOptions = null;

  static readConfigFile(configFilePath = join(process.cwd(), CONFIG_FILE)): SecureNativeOptions {
    Logger.debug(`Reading ${CONFIG_FILE}`);
    if (existsSync(configFilePath)) {
      const content = readFileSync(configFilePath, 'utf-8');

      try {
        const config = JSON.parse(content);
        const validConfigValues: any = Object.entries(config)
          .filter(([key, val]) => configMap.hasOwnProperty(key))
          .map(([key, val]) => [configMap[key], val])
          .filter(([key, val]) => typeof val === key.type)
          .map(([key, val]) => [key.name, val]);

        return validConfigValues.reduce((obj, [k, v]) => Object.assign(obj, { [k]: v }), {});
      } catch (e) {
        Logger.debug(`Unable to parse ${CONFIG_FILE}`);
      }
    }

    return null;
  }

  static setConfigKey(key: string, val: any) {
    if (this.config) {
      this.config[key] = val;
    }
  }

  static getConfigKey(key: string): any {
    return this.config?.[key];
  }

  static loadConfig(configFilePath = join(process.cwd(), CONFIG_FILE)) {
    const fileConfig = this.readConfigFile(configFilePath) || {};

    this.config = {
      apiKey: fileConfig['apiKey'] || process.env.SECURENATIVE_API_KEY || null,
      appName: fileConfig['appName'] || process.env.SECURENATIVE_APP_NAME || '',
      apiUrl: fileConfig['apiUrl'] || process.env.SECURENATIVE_API_URL || 'https://api.securenative.com/collector/api/v1',
      interval: fileConfig['interval'] || toNumber(process.env.SECURENATIVE_INTERVAL, 1000),
      maxEvents: fileConfig['maxEvents'] || toNumber(process.env.SECURENATIVE_MAX_EVENTS, 1000),
      timeout: fileConfig['timeout'] || toNumber(process.env.SECURENATIVE_TIMEOUT, 1500),
      autoSend: fileConfig.hasOwnProperty('autoSend') ? fileConfig['autoSend'] : toBoolean(process.env.SECURENATIVE_AUTO_SEND, true),
      disable: fileConfig.hasOwnProperty('disable') ? fileConfig['disable'] : toBoolean(process.env.SECURENATIVE_DISABLE, false),
      logLevel: fileConfig['logLevel'] || process.env.SECURENATIVE_LOG_LEVEL || 'fatal',
      failoverStrategy: isEnum(FailoveStrategy, String(fileConfig['failoverStrategy']))
        ? fileConfig['failoverStrategy']
        : toEnum(FailoveStrategy, process.env.SECURENATIVE_FAILOVER_STRATEGY, FailoveStrategy.FailOpen),
      minSupportedVersion: '4.9.1',
      proxyHeaders: fileConfig['proxyHeaders'] || toArray(process.env.SECURENATIVE_PROXY_HEADERS, null),
      piiHeaders: fileConfig['piiHeaders'] || toArray(process.env.SECURENATIVE_PII_HEADERS, null),
      piiRegexPattern: fileConfig['piiRegexPattern'] || process.env.SECURENATIVE_PII_REGEX_PATTERN || null,
    };
  }

  static getConfig(configFilePath = join(process.cwd(), CONFIG_FILE)): SecureNativeOptions {
    if (!this.config) {
      this.loadConfig(configFilePath);
    }
    return this.config;
  }
}
