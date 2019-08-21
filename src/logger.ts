import pino from 'pino';


import { SecureNativeOptions } from './securenative-options';

const defaultSettings: pino.LoggerOptions = {
  level: 'debug',
  prettyPrint: {
    crlf: false,
    errorLikeObjectKeys: ["err", "error"],
    errorProps: "",
    levelFirst: true,
    timestampKey: "time",
    translateTime: false,
    ignore: "pid,hostname"
  }
};

export interface ILogger {
  debug(msg: string, ...args: any[]);
}

export class Logger {
  private static log: ILogger;
  static initLogger(options: SecureNativeOptions) {
    const settings = Object.assign({}, { "enabled": options.debugMode || false }, defaultSettings);
    Logger.log = pino(settings);
  }

  static debug(msg: string, ...args: any[]) {
    if (Logger.log) {
      Logger.log.debug(msg, args);
    }
  }
}
