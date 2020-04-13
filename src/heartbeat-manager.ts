import { Logger } from './logger';

export default class HeartBeatManager {
  private timeoutId = null;

  constructor(private interval: number, private handler: Function) {}

  startHeartBeatLoop() {
    Logger.debug(`Agent starting heartbeat`);
    this.handler();
    this.timeoutId = setInterval(() => {
      try {
        this.handler();
      } catch (ex) {
        Logger.error('HeartBeat encountered an error', ex);
      }
    }, this.interval);
  }

  stopHeartBeatLoop() {
    Logger.debug(`Agent stopping heartbeat`);
    if (this.timeoutId != null) {
      clearInterval(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
