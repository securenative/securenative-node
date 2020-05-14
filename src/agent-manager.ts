import EventManager from './event-manager';
import { SecureNativeOptions } from './types/securenative-options';
import { Logger } from './logger';
import { AgentConfigOptions } from './types/agent-config-options';
import HeartBeatManager from './heartbeat-manager';
import ModuleManager from './module-manager';
import RulesManager from './rules/rule-manager';
import ActionManager from './actions/action-manager';
import ApiManager from './api-manager';
import InterceptorManager from './interceptors/interceptor-manager';
import { IMiddleware } from './middleware/middleware';
import { createMiddleware } from './middleware/midlleware-factory';

export default class AgentManager {
  public middleware: IMiddleware;
  private interceptorManager: InterceptorManager;
  private lazyOperation: Promise<any> = Promise.resolve();
  private isAgentStarted: boolean = false;
  private heartBeatManager: HeartBeatManager;
  private configUpdateTs: number =0;

  constructor(
    public moduleManager: ModuleManager,
    public apiManager: ApiManager,
    private eventManager: EventManager,
    private options: SecureNativeOptions
  ) {
    this.interceptorManager = new InterceptorManager(moduleManager, this.apiManager, options);

    if (!options.disable) {
      // create middleware
      this.middleware = createMiddleware(this);
      this.middleware.verifyWebhook = this.middleware.verifyWebhook.bind(this.middleware);
      this.middleware.verifyRequest = this.middleware.verifyRequest.bind(this.middleware);

      // apply interceptors
      this.interceptorManager.applyInterceptors(this.middleware.verifyRequest, this.middleware.errorHandler);
    }
  }

  public get apiKey(): string {
    return this.options.apiKey;
  }

  private configurationUpdate() {
    // we don't want to rescheduale in case agent is stoped
    if (!this.isAgentStarted) {
      return;
    }

    this.apiManager
      .configurationUpdate(this.configUpdateTs)
      .then((config) => {
        this.handleConfigUpdate(config);
      })
      .catch((ex) => {})
      .finally(() => {
        // scheduale next call
        process.nextTick(this.configurationUpdate.bind(this));
      });
  }

  private handleConfigUpdate(config: AgentConfigOptions) {
    Logger.debug('Handling config update');

    if (!config) {
      return;
    }

    if (config.timestamp > this.configUpdateTs) {
      this.configUpdateTs = config.timestamp;
    }

    // enforce all rules
    if (config.rules) {
      RulesManager.enforceRules(config.rules);
    }

    // enforce all actions
    if (config.actions) {
      ActionManager.enforceActions(config.actions);
    }
  }

  public async startAgent(): Promise<boolean> {
    return (this.lazyOperation = new Promise(async (resolve, reject) => {
      if (this.options.disable) {
        Logger.debug('Agent is disabled, skipping agent start');
        return resolve(false);
      }

      if (!this.options.apiKey) {
        Logger.fatal('You must pass your SecureNative api key!');
        return reject(false);
      }

      if (!this.isAgentStarted) {
        Logger.debug('Attempting to start agent');

        try {
          // obtain session
          const data = await this.apiManager.agentLogin(this.moduleManager);
          if (data.sessionId) {
            //update config
            this.handleConfigUpdate(data.config);

            //start hgeart beats
            this.heartBeatManager = new HeartBeatManager(this.options.heartBeatInterval, this.apiManager.heartBeat.bind(this));
            this.heartBeatManager.startHeartBeatLoop();
            this.eventManager.setSessionId(data.sessionId);
            this.eventManager.startEventsPersist();
            this.isAgentStarted = true;
            
            //schedual config update
            this.configurationUpdate.call(this);
            Logger.debug('Agent successfuly started!');
            return resolve(true);
          } else {
            Logger.debug('No session obtained, unable to start agent!');
          }
        } catch (ex) {
          const backOff = Math.ceil(Math.random() * 10) * 1000;
          Logger.warn('Failed to start agent, will retry after backoff', backOff);
          setTimeout(() => this.startAgent().catch(() => {}), backOff);
          return reject(false);
        }
      } else {
        Logger.debug('Agent already started, skipping');
        return resolve(true);
      }
      reject(false);
    }));
  }

  public async stopAgent(): Promise<boolean> {
    // if there is pending operation wait for compleation
    await this.lazyOperation;

    if (this.isAgentStarted) {
      Logger.debug('Atempting to stop agent');
      const status = await this.apiManager.agentLogout();
      if (status) {
        //stop heartbeat
        this.heartBeatManager.stopHeartBeatLoop();
        //stop event loop
        await this.eventManager.stopEventsPersist();
        this.isAgentStarted = false;
      }
    }

    return true;
  }
}
