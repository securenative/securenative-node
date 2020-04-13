import FailoveStrategy from "../enums/failover-strategy";

export type SecureNativeOptions = {
  apiKey?: string;
  appName?: string;
  hostId?: string;
  apiUrl?: string;
  interval?: number;
  heartBeatInterval?: number;
  maxEvents?: number;
  timeout?: number;
  autoSend?: boolean;
  disable?: boolean;
  logLevel?: string;
  failoverStrategy?: FailoveStrategy;
  minSupportedVersion?: string;
}
