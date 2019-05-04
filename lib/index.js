const assert = require('assert');
const rp = require('request-promise');

const EventManager = require('./event-manager');
const EventTypes = require('./event-types');

function SecureNative(apiKey, opts) {
  if (!(this instanceof SecureNative)) {
    return new SecureNative(apiKey, opts);
  }
  assert(apiKey, 'You must pass your SecureNative api key');

  const options = opts || {};

  this.clientOptions = {
    uri: options.host || 'https://api.securenative.com/v1/',
    headers: {
      'User-Agent': 'SecureNative SDK NODEJS',
      'Authorization': apiKey
    },
    qsStringifyOptions: {
      encode: false
    },
    json: true
  };

  this.eventTypes = EventTypes;
  this.event = new EventManager(options);
}

SecureNative.prototype.track = function (req, opts) {
  const message = this.event.build(req, opts);
  message.eventType = opts.eventType || verbs.LOG_IN;

  const options = Object.assign({}, this.clientOptions, {
    uri: this.clientOptions.uri + '/events',
    body: message
  });

  console.log(options);
  return rp(options);
};

module.exports = SecureNative;
