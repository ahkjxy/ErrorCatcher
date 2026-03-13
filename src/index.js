const ErrorCatcher = require('./core/ErrorCatcher');

function initErrorTracker(config = {}) {
  const tracker = new ErrorCatcher(config);
  if (!tracker.initialized && !tracker.isServer) {
    tracker.init();
  }
  return tracker;
}

if (typeof window !== 'undefined') {
  window.ErrorCatcher = ErrorCatcher;
  window.initErrorTracker = initErrorTracker;
}

module.exports = {
  ErrorCatcher,
  initErrorTracker,
  default: ErrorCatcher
};
