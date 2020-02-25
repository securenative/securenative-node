import { IPSet } from 'futoin-ipset';
import SetType from './enums/set-type';

export class ActionSet {
  private multiSet = {
    ip: new IPSet(),
    path: new Map<string, NodeJS.Timeout>(),
    user: new Map<string, NodeJS.Timeout>(),
    country: new Map<string, NodeJS.Timeout>()
  };

  constructor(private name: string) { }

  public add(setType: SetType, item: string, ts?: number, ttl?: number) {
    const intervalId = (ts) ? setTimeout(() => this.delete(setType, item), ttl * 1000 - (new Date().getTime() - ts)) : null;
    const set = this.getSet(setType);

    if (setType === SetType.IP) {
      if (!this.isValidIP(set, item)) {
        return;
      }
      set.add(item, { intervalId: intervalId });
    } else {
      set.set(item, intervalId);
    }
  }

  public has(setType: SetType, item: string): boolean {
    const set = this.getSet(setType);

    if (setType === SetType.IP) {
      if (!this.isValidIP(set, item)) {
        return false;
      }
      return set.match(item) !== undefined;
    }
    return set.has(item);
  }

  public delete(setType: SetType, item: string) {
    let intervalId = null;
    const set = this.getSet(setType);
    if (setType === SetType.IP) {
      const match = set.match(item);
      if (match) {
        intervalId = match.intervalId;
      }
      set.remove(item);
    } else {
      intervalId = set.get(item);
      set.delete(item);
    }

    if (intervalId) {
      clearInterval(intervalId);
    }
  }

  private getSet(setType: SetType) {
    return this.multiSet[setType];
  }

  private isValidIP(ipset: IPSet, ip: string): boolean {
    try {
      return ipset.convertAddress(ip) !== null;
    } catch (ex) {
      return false;
    }
  }
}
