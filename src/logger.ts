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
  debug: pino.LogFn;
}

export function initLogger(options: SecureNativeOptions): ILogger {
  const settings = Object.assign({}, { "enabled": options.debugMode || false }, defaultSettings);
  const logger = pino(settings);
  return logger;
}
