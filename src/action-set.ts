import { IPSet } from 'futoin-ipset';

export enum SetType {
  IP = "ip",
  USER = "user",
  COUNTRY = "country"
}

export class ActionSet {
  private multiSet = {
    ip: new IPSet(),
    user: new Map<string, NodeJS.Timeout>(),
    country: new Map<string, NodeJS.Timeout>()
  };
  constructor(private name: string) { }

  public add(setType: SetType, item: string, timeout?: number) {
    const intervalId = (timeout) ? setTimeout(() => this.delete(setType, item), timeout) : null;
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

//const whitelist = new ActionSet("Whitelist");
//const blacklist = new ActionSet("Blacklist");