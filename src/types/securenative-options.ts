import FailoveStrategy from '../enums/failover-strategy';

export type SecureNativeOptions = {
  apiKey?: string;
  appName?: string;
  apiUrl?: string;
  interval?: number;
  maxEvents?: number;
  timeout?: number;
  autoSend?: boolean;
  disable?: boolean;
  logLevel?: string;
  failoverStrategy?: FailoveStrategy;
  proxyHeaders?: string[];
  minSupportedVersion?: string;
};
