import { blackList } from './../actions-list';
import Action from '../actions/action';
import SetType from '../enums/set-type';
import { Logger } from '../logger';

export default class BlacklistIp {
  constructor(private action: Action) { }

  apply() {
    if (this.action.values) {
      this.action.values.forEach(value => {
        Logger.debug(`Blacklisting ip: ${value}`);
        blackList.add(SetType.IP, value, this.action.ttl);
      });
    }
  }
}
