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

/**
 * @copyright wbinnssmith
 */
x.Deferred = function Deferred() {
  this.promise = new Promise((resolve, reject) => {
    this.resolve = resolve;
    this.reject = reject;
  });
};

x.inBounds = (val, min, max) => {
  return Math.max(Math.min(val, max), min);
};

x.jsonp = {};

x.jsonp.register = (fn, suffix = String(Math.random()).slice(2)) => {
  const name = `jsonp${suffix}`.replace('.', '');

  window[name] = fn;

  return name;
};

x.jsonp.clear = name => {
  window[name] = null;
};

x.str = {};

x.str.ucFirst = str => {
  return str[0].toUpperCase() + str.slice(1);
};

x.str.lcFirst = str => {
  return str[0].toLowerCase() + str.slice(1);
};

x.str.camelize = str => {
  return x.str.lcFirst(str
    .replace(/\s/g, '')
    .split('_')
    .map(x.str.ucFirst)
    .join(''));
};
