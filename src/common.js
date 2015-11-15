console.error = function (message) {
  if (arguments.length > 1) {
    message = String.prototype.format.apply(message, Array.prototype.slice.call(arguments, 1));
  }

  console.logTrace(2, "[error] {0}", message);
};

console.info = function (message) {
  if (arguments.length > 1) {
    message = String.prototype.format.apply(message, Array.prototype.slice.call(arguments, 1));
  }

  console.logTrace(2, "[info] {0}", message);
};

console.warn = function (message) {
  if (arguments.length > 1) {
    message = String.prototype.format.apply(message, Array.prototype.slice.call(arguments, 1));
  }

  console.logTrace(2, "[warn] {0}", message);
};