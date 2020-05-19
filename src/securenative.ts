import { SecureNativeOptions } from './types/securenative-options';
import { EventOptions } from './types/event-options';
import EventManager from './event-manager';
import ApiManager from './api-manager';
import VerifyResult from './types/verify-result';
import { Logger } from './logger';
import { PackageManager, Package } from './package-manager';
import ConfigurationManager from './configuration-manager';
import { join } from 'path';

const PACKAGE_FILE_NAME = 'package.json';

export default class SecureNative {
  private apiManager: ApiManager;
  private static instance = null;

  private constructor(eventManager: EventManager, options: SecureNativeOptions) {
    if (!eventManager || !options) {
      throw new Error('Unable to create SecureNative instance, invalid config provided');
    }
    this.apiManager = new ApiManager(eventManager, options);
  }

  public static init(options: SecureNativeOptions) {
    const defaultOptions = ConfigurationManager.getConfig();
    const config: SecureNativeOptions = { ...options, ...defaultOptions };
    
    const eventManager = new EventManager(fetch, config);
    SecureNative.initialize(eventManager, config);
  }

  public static initialize(eventManager: EventManager, options: SecureNativeOptions) {
    if (SecureNative.instance) {
      throw new Error('This SDK was already initialized');
    }

    const appPkg: Package = PackageManager.getPackage(join(process.cwd(), PACKAGE_FILE_NAME));
    // set default app name
    if (!options.appName) {
      ConfigurationManager.setConfigKey('appName', appPkg.name);
    }

    // init logger
    Logger.initLogger(options);
    Logger.debug('Loaded Configurations', JSON.stringify(options));

    SecureNative.instance = new SecureNative(eventManager, options);
  }

  public static getInstance(): SecureNative {
    if (SecureNative.instance == null) {
      throw new Error('You need to init sdk first!');
    }
    return SecureNative.instance;
  }

  public track(opts: EventOptions) {
    return this.apiManager.track(opts);
  }

  public async verify(opts: EventOptions): Promise<VerifyResult> {
    return await this.apiManager.verify(opts);
  }
}
