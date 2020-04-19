import pino from 'pino';

import { SecureNativeOptions } from './types/securenative-options';

const defaultSettings: pino.LoggerOptions = {
  level: 'fatal',
  prettyPrint: {
    crlf: false,
    errorLikeObjectKeys: ['err', 'error'],
    errorProps: '',
    levelFirst: true,
    timestampKey: 'time',
    translateTime: false,
    ignore: 'pid,hostname',
  },
};

export interface ILogger {
  debug(msg: string, ...args: any[]);
  error(msg: string, ...args: any[]);
  fatal(msg: string, ...args: any[]);
  warn(msg: string, ...args: any[]);
  info(msg: string, ...args: any[]);
}

export class Logger {
  private static log: ILogger;
  static initLogger(options: SecureNativeOptions) {
    const settings = Object.assign({}, defaultSettings, { level: options.logLevel || 'fatal' });
    Logger.log = pino(settings);
  }

  static debug(msg: string, ...args: any[]) {
    if (Logger.log) {
      args.length === 0 ? Logger.log.debug(msg) : Logger.log.debug(msg, args);
    }
  }

  static error(msg: string, ...args: any[]) {
    if (Logger.log) {
      args.length === 0 ? Logger.log.error(msg) : Logger.log.error(msg, args);
    }
  }

  static info(msg: string, ...args: any[]) {
    if (Logger.log) {
      args.length === 0 ? Logger.log.info(msg) : Logger.log.info(msg, args);
    }
  }

  static warn(msg: string, ...args: any[]) {
    if (Logger.log) {
      args.length === 0 ? Logger.log.warn(msg) : Logger.log.warn(msg, args);
    }
  }

  static fatal(msg: string, ...args: any[]) {
    if (Logger.log) {
      args.length === 0 ? Logger.log.fatal(msg) : Logger.log.fatal(msg, args);
    }
  }
}
