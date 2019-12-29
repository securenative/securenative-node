
import { SecureNativeOptions } from './securenative-options';
import { EventKinds } from './events/event-kinds';
import { createEvent } from './events/event-factory';
import { EventOptions } from './event-options';
import EventManager from './event-manager';
import RiskResult from './risk-result';
import VerifyResult from './verify-result';
import { IMiddleware } from './middleware/middleware';
import { createMiddleware } from './middleware/midlleware-factory';
import ModuleManager from './module-manager';
import InterceptorManager from './interceptors/interceptor-manager';
import { decrypt } from './utils/utils';
import ActionType from './action-type';
import { Logger } from './logger';
import { SecurityHeaders } from './security-headers';
import HeartBeatManager from './heartbeat-manager';
import { RequestOptions } from './request-options';
const MAX_CUSTOM_PARAMS = 6;

export default class SecureNative {
  private isAgentStarted: boolean = false;
  private eventManager: EventManager;
  private heartBeatManager: HeartBeatManager;
  public middleware: IMiddleware;
  public lazyOperation: Promise<any> = Promise.resolve();
  public securityHeaders: SecurityHeaders = {};

  constructor(public moduleManager: ModuleManager, private options: SecureNativeOptions) {
    this.eventManager = new EventManager(this.options);
  }

  public get apiKey(): string {
    return this.options.apiKey;
  }

  public track(opts: EventOptions, req?: any) {
    Logger.debug("Track event call", opts);
    if (opts && opts.params && opts.params.length > MAX_CUSTOM_PARAMS) {
      throw new Error(`You can only specify maximum of ${MAX_CUSTOM_PARAMS} params`);
    }

    const requestUrl = `${this.options.apiUrl}/track`;

    const event = createEvent(EventKinds.SDK, req, opts, this.options);
    this.eventManager.sendAsync(event, requestUrl);
  }

  public async verify(opts: EventOptions, req?: any): Promise<VerifyResult> {
    Logger.debug("Verify risk call", opts);
    const requestUrl = `${this.options.apiUrl}/verify`;
    const event = createEvent(EventKinds.SDK, req, opts, this.options);

    try {
      const result = await this.eventManager.sendSync(event, requestUrl);
      Logger.debug("Successfuly called virify", result);
      return result;
    } catch (ex) {
      Logger.debug("Failed to call virify", ex);
      return {
        riskLevel: "low",
        score: 0,
        triggers: []
      }
    }
  }

  public async risk(opts: RequestOptions): Promise<RiskResult> {
    Logger.debug("Risk call", opts);
    const requestUrl = `${this.options.apiUrl}/risk`;
    const event = createEvent(EventKinds.REQUEST, opts);
    try {
      Logger.debug("Risk event", JSON.stringify(event));
      const result = await this.eventManager.sendSync(event, requestUrl);
      const data = decrypt(result.data, this.apiKey);
      Logger.debug("Successfuly performed risk", data);
      return JSON.parse(data);
    } catch (ex) {
      Logger.debug("Failed to perform risk call", ex);
      return {
        action: ActionType.ALLOW,
        riskLevel: "low",
        score: 0
      }
    }
  }

  public flow(flowId: number, opts: EventOptions, req?: any): Promise<RiskResult> {
    Logger.debug("Flow call:", flowId);
    const requestUrl = `${this.options.apiUrl}/flow/${flowId}`;
    const event = createEvent(EventKinds.SDK, req, opts, this.options);
    return this.eventManager.sendSync(event, requestUrl);
  }

  public async heartBeat() {
    Logger.debug("HeartBeat");
    const requestUrl = `${this.options.apiUrl}/agent-heart-beat`;
    const event = createEvent(EventKinds.HEARTBEAT, this.options.appName);
    this.eventManager.sendAsync(event, requestUrl, false);
  }

  public async error(err: Error) {
    Logger.debug("Error", err);
    const requestUrl = `${this.options.apiUrl}/agent-error`;
    const event = createEvent(EventKinds.ERROR, err);
    this.eventManager.sendAsync(event, requestUrl);
  }

  private async agentLogin(): Promise<string> {
    Logger.debug("Performing agent login");
    const requestUrl = `${this.options.apiUrl}/agent-login`;

    const framework = this.moduleManager.framework;
    const frameworkVersion = this.moduleManager.pkg.dependencies[this.moduleManager.framework];

    const event = createEvent(EventKinds.AGENT_LOGIN, framework, frameworkVersion, this.options.appName);
    try {
      const { sessionId } = await this.eventManager.sendSync(event, requestUrl);
      Logger.debug(`Agent successfuly logged-in, sessionId: ${sessionId}`);
      //start hgeart beats    
      this.heartBeatManager = new HeartBeatManager(this.options.heartBeatInterval, this.heartBeat.bind(this));
      this.heartBeatManager.startHeartBeatLoop();
      return sessionId;
    } catch (ex) {
      Logger.debug("Failed to perform agent login", ex);
    }
    return Promise.reject(null);
  }

  private async agentLogout(): Promise<boolean> {
    Logger.debug("Performing agent logout");
    const requestUrl = `${this.options.apiUrl}/agent-logout`;
    const event = createEvent(EventKinds.AGENT_LOGOUT);

    try {
      this.eventManager.sendSync(event, requestUrl);
      Logger.debug('Agent successfuly logged-out');
      this.heartBeatManager.stopHeartBeatLoop();
      return true;
    } catch (ex) {
      Logger.debug("Failed to perform agent logout", ex);
    }
    return Promise.reject(false);
  }

  public async startAgent(): Promise<boolean> {
    return this.lazyOperation = new Promise(async (resolve, reject) => {

      if (!this.isAgentStarted) {
        Logger.debug("Attempting to start agent");
        if (!this.options.apiKey) {
          console.error('You must pass your SecureNative api key!');
          reject(false);
        }

        if (this.options.disable) {
          Logger.debug("Skipping agent start");
          resolve(false);
        }

        // create middleware
        this.middleware = createMiddleware(this);
        this.middleware.verifyWebhook = this.middleware.verifyWebhook.bind(this.middleware);
        this.middleware.verifyRequest = this.middleware.verifyRequest.bind(this.middleware);

        // apply interceptors
        InterceptorManager.applyInterceptors(this.moduleManager, this.middleware.verifyRequest, this.middleware.errorHandler);

        // obtain session
        const sessionId = await this.agentLogin();
        if (sessionId) {
          this.eventManager.setSessionId(sessionId);
          this.eventManager.startEventsPersist();
          this.isAgentStarted = true;

          Logger.debug("Agent successfuly started!");
          resolve(true);
        } else {
          Logger.debug("No session obtained, unable to start agent!");
        }
      } else {
        Logger.debug("Agent already started, skipping");
      }
      reject(false);
    });
  }

  public async stopAgent(): Promise<any> {
    // if there is pending operation wait for compleation
    await this.lazyOperation;

    if (this.isAgentStarted) {
      Logger.debug("Atempting to stop agent");
      const status = await this.agentLogout();
      if (status) {
        await this.eventManager.stopEventsPersist();
        this.isAgentStarted = false;
      }
    }
  }
}
