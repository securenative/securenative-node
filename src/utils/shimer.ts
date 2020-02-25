import { wrap } from 'shimmer';

export const wrapListener = (module, method, listner, callback) => {
  wrap(module, method, function (original) {
    return function (event) {
      if (event === listner) {
        const status = callback.apply(this, arguments);
        if (!status) {
          return;
        }
      }
      return original.apply(this, arguments);
    };
  });
}
