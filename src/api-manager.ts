import { Logger } from './logger';
import { createEvent } from './events/event-factory';
import { EventOptions } from './types/event-options';
import SDKEvent from './events/sdk-event';
import { SecureNativeOptions } from './types/securenative-options';
import EventManager from './event-manager';
import VerifyResult from './types/verify-result';
import ApiRoute from './enums/api-route';
import RiskResult from './types/risk-result';
import { decrypt } from './utils/utils';
import ActionType from './enums/action-type';
import ErrorEvent from './events/error-event';
import AgentLogoutEvent from './events/agent-logout-event';
import { AgentLoginOptions } from './types/agent-login-options';
import AgentHeartBeatEvent from './events/agent-heartbeat-event';
import AgentLoginEvent from './events/agent-login-event';
import ModuleManager from './module-manager';
import { AgentConfigOptions } from './types/agent-config-options';
import AgentConfigEvent from './events/agent-config-event';
import FailoveStrategy from './enums/failover-strategy';
import RequestEvent from './events/request-event';
import { RequestOptions } from './types/request-options';

const MAX_CUSTOM_PROPERTIES = 10;

export default class ApiManager {
  constructor(private eventManager: EventManager, private options: SecureNativeOptions) {}

  public track(opts: EventOptions) {
    Logger.debug('Track event call', opts);
    if (opts && opts.properties && Object.keys(opts.properties).length > MAX_CUSTOM_PROPERTIES) {
      throw new Error(`You can only specify maximum of ${MAX_CUSTOM_PROPERTIES} custom properties`);
    }

    const requestUrl = `${this.options.apiUrl}/${ApiRoute.Track}`;
    const event = createEvent(SDKEvent, opts, this.options);
    this.eventManager.sendAsync(event, requestUrl);
  }

  public async verify(opts: EventOptions): Promise<VerifyResult> {
    Logger.debug('Verify risk call', opts);

    const requestUrl = `${this.options.apiUrl}/${ApiRoute.Verify}`;
    const event = createEvent(SDKEvent, opts, this.options);

    try {
      const result = await this.eventManager.sendSync<VerifyResult>(event, requestUrl);
      Logger.debug('Successfuly called verify', result);
      return result;
    } catch (ex) {
      Logger.error('Failed to call verify', ex);
      return this.options.failoverStrategy === FailoveStrategy.FailOpen
        ? { riskLevel: 'low', score: 0, triggers: [] }
        : { riskLevel: 'high', score: 1, triggers: [] };
    }
  }

  public risk(opts: RequestOptions) {
    Logger.debug('Risk call', opts);

    const requestUrl = `${this.options.apiUrl}/${ApiRoute.Risk}`;
    const event = createEvent(RequestEvent, opts, this.options);
    Logger.debug('Risk event', event);
    this.eventManager.sendAsync(event, requestUrl);
  }

  public async heartBeat() {
    Logger.debug('HeartBeat');
    const requestUrl = `${this.options.apiUrl}/${ApiRoute.Heartbeat}`;
    const event = createEvent(AgentHeartBeatEvent, this.options.appName);
    this.eventManager.sendSync(event, requestUrl);
  }

  public async agentLogin(moduleManager: ModuleManager): Promise<AgentLoginOptions> {
    Logger.debug('Performing agent login');
    const requestUrl = `${this.options.apiUrl}/${ApiRoute.Login}`;

    const framework = moduleManager.framework;
    const frameworkVersion = moduleManager.pkg?.dependencies[moduleManager.framework];

    const event = createEvent(AgentLoginEvent, this.options.hostId, framework, frameworkVersion, this.options.appName);
    try {
      const res = await this.eventManager.sendSync<AgentLoginOptions>(event, requestUrl);
      Logger.debug(`Agent successfuly logged-in, sessionId: ${res.sessionId}`);
      return res;
    } catch (ex) {
      Logger.warn('Failed to perform agent login', ex);
    }

    return null;
  }

  public async agentLogout(): Promise<boolean> {
    Logger.debug('Performing agent logout');
    const requestUrl = `${this.options.apiUrl}/${ApiRoute.Logout}`;
    const event = createEvent(AgentLogoutEvent);

    try {
      this.eventManager.sendSync<any>(event, requestUrl);
      Logger.debug('Agent successfuly logged-out');
      return true;
    } catch (ex) {
      Logger.warn('Failed to perform agent logout', ex);
    }
    return Promise.reject(false);
  }

  public async agentError(err: Error) {
    Logger.debug('Error', err);
    const requestUrl = `${this.options.apiUrl}/${ApiRoute.Error}`;
    const event = createEvent(ErrorEvent, err);
    this.eventManager.sendAsync(event, requestUrl);
  }

  public async configurationUpdate(configUpdateTs: number): Promise<AgentConfigOptions> {
    Logger.debug('ConfigurationUpdate');
    const requestUrl = `${this.options.apiUrl}/${ApiRoute.Config}`;
    Logger.debug(`Requesting changes for, ${configUpdateTs}`);
    const event = createEvent(AgentConfigEvent, this.options.hostId, this.options.appName, configUpdateTs);

    try {
      const res = await this.eventManager.sendSync<AgentConfigOptions>(event, requestUrl, 0);
      return res;
    } catch (ex) {
      Logger.warn('Failed to get configurations update', ex);
    }

    return null;
  }
}
