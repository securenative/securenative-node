import { SecureNativeOptions } from './types/securenative-options';
import { EventOptions } from './types/event-options';
import EventManager from './event-manager';
import ApiManager from './api-manager';
import VerifyResult from './types/verify-result';
import { Logger } from './logger';
import { PackageManager, Package } from './package-manager';
import ConfigurationManager from './configuration-manager';
import { join } from 'path';
import ModuleManager from './module-manager';
import { IMiddleware } from './middleware/middleware';
import { createMiddleware } from './middleware/midlleware-factory';
import fetch from 'node-fetch';

const PACKAGE_FILE_NAME = 'package.json';

export default class SecureNative {
  private apiManager: ApiManager;
  public middleware: IMiddleware;
  private static instance: SecureNative;

  private constructor(eventManager: EventManager, moduleManager: ModuleManager, private options: SecureNativeOptions) {
    if (!eventManager || !moduleManager || !options) {
      throw new Error('Unable to create SecureNative instance, invalid config provided');
    }

    if (!options.disable) {
      // create middleware
      this.middleware = createMiddleware(moduleManager, options);
      this.middleware.verifyWebhook = this.middleware.verifyWebhook.bind(this.middleware);
    }

    this.apiManager = new ApiManager(eventManager, options);
  }

  public static init(options: SecureNativeOptions) {
    const defaultOptions = ConfigurationManager.getConfig();
    const config: SecureNativeOptions = { ...defaultOptions, ...options };

    const eventManager = new EventManager(fetch, config);
    if (config.autoSend) {
      eventManager.startEventsPersist();
    }
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

    // create moduleManager
    const moduleManager = new ModuleManager(appPkg);

    // init logger
    Logger.initLogger(options);
    Logger.debug('Loaded Configurations', JSON.stringify(options));

    const secureNative = new SecureNative(eventManager, moduleManager, options);

    SecureNative.instance = secureNative;
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
