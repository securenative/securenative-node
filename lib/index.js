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
  options.interval = options.interval || 1000;

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

  this.events = [];
  this.eventTypes = EventTypes;
  this.eventManager = new EventManager(options);
  this.sendEnabled = true;

  setInterval(() => {
    this.sendEvents();
  }, options.interval);
}

SecureNative.prototype.sendEvents = function () {
  if (this.events.length > 0 && this.sendEnabled) {
    const eventOptions = this.events.shift();
    rp(eventOptions).catch((err) => {
      this.events.unshift(event);
      const backOff = Math.ceil(Math.random() * 10) * 1000;
      this.sendEnabled = false;
      setTimeout(() => this.sendEnabled = true, backOff);
    });
  }
}

SecureNative.prototype.track = function (req, opts) {
  const event = this.eventManager.build(req, opts);
  event.eventType = opts.eventType || verbs.LOG_IN;

  const eventOptions = Object.assign({}, this.clientOptions, {
    uri: this.clientOptions.uri + '/events',
    body: event
  });

  this.events.push(eventOptions);
};

module.exports = SecureNative;
