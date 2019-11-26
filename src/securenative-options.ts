export interface SecureNativeOptions {
  apiKey?: string;
  appName: string;
  apiUrl?: string;
  interval?: number;
  maxEvents?: number;
  timeout?: number;
  autoSend?: boolean;
  disable?: boolean;
  debugMode?: boolean;
  minSupportedVersion?: string;
}
