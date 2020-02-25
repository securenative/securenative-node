import { blackList } from './../actions-list';
import Action from '../actions/action';
import SetType from '../enums/set-type';

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
