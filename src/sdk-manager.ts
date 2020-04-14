import ApiManager from "./api-manager";
import { EventOptions } from "./types/event-options";
import VerifyResult from "./types/verify-result";

export class SDKManager {
  constructor(private apiManager: ApiManager) {}

  public track(opts: EventOptions) {
    return this.apiManager.track(opts);
  }

  public async verify(opts: EventOptions): Promise<VerifyResult> {
    return await this.apiManager.verify(opts);
  }
}
