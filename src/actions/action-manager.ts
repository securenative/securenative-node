import { processors } from './../processors';
import Action from './action';

const ActionProcessors = {
  'block_ip': [processors.BlacklistIp]
};

export default class ActionManager {
  static enforceActions = (actions: Array<Action>) => {
    console.log('enforcing actions');
    actions.forEach((action: Action) => {
      const processors = ActionProcessors[action.name] || [];
      processors.forEach(processor => {
        new processor(action).apply();
      });
    });
  }
}
