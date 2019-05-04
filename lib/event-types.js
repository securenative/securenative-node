const EventTypes = Object.freeze({
  LOG_IN: "log-in",
  LOG_IN_DENIED: "log-in-denied",
  LOG_IN_CHALLENGE: "log-in-challenge",
  LOG_OUT: "log-out",
  AUTH_CHALLENGE: "authentication-challenge",
  AUTH_CHALLENGE_PASS: "authentication-challenge-pass",
  AUTH_CHALLENGE_FAIL: "authentication-challenge-fail",
  EMAIL_UPDATE: "email-update",
  PASSWORD_UPDATE: "password-update",
  TWO_FACTOR_DISABLE: "two-factor-disable",
  PASSWORD_RESET_REQUEST: "password-reset-request",
  PASSWORD_RESET: "password-reset",
  PASSWORD_RESET_FAIL: "password-reset-fail"
});


module.exports = EventTypes;