import { blackList } from './../actions-list';
import { SetType } from '../action-set';
import Action from '../actions/action';

export default class BlacklistIp {
  constructor(private action: Action) { }

  apply() {
    if (this.action.values) {
      this.action.values.forEach(value => {
        console.log(`Blacklisting ip: ${value}`);
        blackList.add(SetType.IP, value, this.action.ttl);
      });
    }
  }
}
