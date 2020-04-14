import { SecureNativeOptions } from './types/securenative-options';
import EventManager from './event-manager';
import ModuleManager from './module-manager';
import AgentManager from './agent-manager';
import ApiManager from './api-manager';
import { SDKManager } from './sdk-manager';

export default class SecureNative {
  private sdkManager: SDKManager;
  private agentManager: AgentManager;
  public apiManager: ApiManager;

  constructor(moduleManager: ModuleManager, eventManager: EventManager, options: SecureNativeOptions) {
    if (!moduleManager || !eventManager || !options) {
      throw new Error('Unable to create SecureNative instance, invalid config provided');
    }
    this.apiManager = new ApiManager(eventManager, options);
    this.sdkManager = new SDKManager(this.apiManager);
    this.agentManager = new AgentManager(moduleManager, this.apiManager, eventManager, options);
  }

  public get agent(): AgentManager {
    return this.agentManager;
  }

  public get sdk() {
    return this.sdkManager;
  }
}
