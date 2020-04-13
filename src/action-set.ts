import { IPSet } from 'futoin-ipset';
import SetType from './enums/set-type';

export class ActionSet {
  private multiSet: Object;

  constructor(private name: string) {
    this.clear();
  }

  public add(setType: SetType, item: string, ts?: number, ttl?: number) {
    const expireTs = (ts && ttl !== -1) ? ts + ttl * 1000 : -1;
    const set = this.getSet(setType);

    if (setType === SetType.IP) {
      if (!this.isValidIP(set, item)) {
        return;
      }
      set.add(item, { expireTs: expireTs });
    } else {
      set.set(item, expireTs);
    }

    this.removeExpiredSets();
  }

  public has(setType: SetType, item: string): boolean {
    const now = Date.now();
    const set = this.getSet(setType);
    let expireTs = null;
    if (setType === SetType.IP) {
      if (!this.isValidIP(set, item)) {
        return false;
      }
      const ipRecord = set.match(item) || {};
      expireTs = ipRecord.expireTs;
    } else {
      expireTs = set.get(item);
    }

    if (expireTs) {
      if (expireTs !== -1 && now > expireTs) {
        // clear item
        this.delete(setType, item);
        return false;
      }
      return true;
    }

    return false;
  }

  public delete(setType: SetType, item: string) {
    let expireTs = null;
    const set = this.getSet(setType);
    if (setType === SetType.IP) {
      if (!this.isValidIP(set, item)) {
        return;
      }
      set.remove(item);
    } else {
      set.delete(item);
    }
  }

  public clear() {
    this.multiSet = {
      ip: new IPSet(),
      path: new Map<string, Number>(),
      user: new Map<string, Number>(),
      country: new Map<string, Number>()
    };
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

  private removeExpiredSets() {
    for (let setType in SetType) {
      this.removeExpiredSet(SetType[setType]);
    }
  }

  private removeExpiredSet(setType: SetType) {
    const set = this.getSet(setType);

    if (setType === SetType.IP) {
      for (let [sub, m] of set._v4._pm) {
        for (let key of m.keys()) {
          this.has(setType, key + "/" + sub);
        }
      }

      for (let [sub, m] of set._v6._pm) {
        for (let key of m.keys()) {
          set.has(key + "/" + sub);
        }
      }
    } else {
      for (let key of set) {
        this.has(setType, key);
      }
    }
  }
}
