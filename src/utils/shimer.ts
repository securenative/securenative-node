import { wrap } from 'shimmer';

export const wrapListener = (module, method, listner, callback) => {
  wrap(module, method, function (original) {
    return function (event) {
      if (event === listner) {
        callback.apply(this, arguments);
      }
      return original.apply(this, arguments);
    };
  });
}
