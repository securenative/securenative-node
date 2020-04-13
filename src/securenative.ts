import { SecureNativeOptions } from './types/securenative-options';
import EventManager from './event-manager';
import ModuleManager from './module-manager';
import AgentManager from './agent-manager';
import ApiManager from './api-manager';

export default class SecureNative {
  private agentManager: AgentManager;
  public apiManager: ApiManager;

  constructor(public moduleManager: ModuleManager, eventManager: EventManager, private options: SecureNativeOptions) {
    if (!moduleManager || !eventManager || !options) {
      throw new Error('Unable to create SecureNative instance, invalid config provided');
    }

    this.apiManager = new ApiManager(eventManager, options);
    this.agentManager = new AgentManager(moduleManager, this.apiManager, eventManager, options);
  }

  public get agent(): AgentManager {
    return this.agentManager;
  }

  public get SDK() {
    return {
      track: this.apiManager.track,
      verify: this.apiManager.verify,
    };
  }
}
