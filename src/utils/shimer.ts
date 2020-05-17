import { wrap } from 'shimmer';
import SessionManager from '../session-manager';

export const wrapListener = (module, method, listner, callback) => {
  wrap(module, method, function (original) {
    return function (event) {
      if (event === listner) {
        const status = callback.apply(this, arguments);
        if (!status) {
          return;
        }
        // @ts-ignore
        const [ , req, res ] = arguments;

        const ns = SessionManager.getNs();
        ns.bindEmitter(req);
        ns.bindEmitter(res);

        return ns.run(() => {
          ns.set('req', req);
          ns.set('res', res);
          return original.apply(this, arguments);
        });
      }
      return original.apply(this, arguments);
    };
  });
};
