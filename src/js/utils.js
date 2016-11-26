window.x = window.x || {};

x.loadScript = src => {
  return new Promise((resolve, reject) => {
    document.head.appendChild(Object.assign(
      document.createElement('script'),
      { src, onload: resolve, onerror: reject }
    ));
  });
};

/**
 * @copyright Remy Sharp
 */
x.throttle = (fn, threshhold, scope) => {
  threshhold || (threshhold = 250);
  var last,
      deferTimer;
  return function () {
    var context = scope || this;

    var now = +new Date,
        args = arguments;
    if (last && now < last + threshhold) {
      // hold on to it
      clearTimeout(deferTimer);
      deferTimer = setTimeout(function () {
        last = now;
        fn.apply(context, args);
      }, threshhold);
    } else {
      last = now;
      fn.apply(context, args);
    }
  };
};

x.inBounds = (val, min, max) => {
  return Math.max(Math.min(val, max), min);
};
