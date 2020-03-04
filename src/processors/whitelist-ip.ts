import ActionsList from './../actions-list';
import Action from '../actions/action';
import SetType from '../enums/set-type';
import { Logger } from '../logger';

export default class WhitelistIp {
  constructor(private action: Action) { }

  apply() {
    if (this.action.values) {
      this.action.values.forEach(value => {
        Logger.debug(`Whitelisting ip: ${value}`);
        ActionsList.whitelist.add(SetType.IP, value, this.action.ttl);
      });
    }
  }
}
