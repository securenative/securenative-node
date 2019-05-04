const EventTypes = Object.freeze({
  LOG_IN: "LogIn",
  LOG_IN_DENIED: "LogInDenied",
  LOG_IN_CHALLENGE: "LogInChallenge",
  LOG_OUT: "LogOut",
  AUTH_CHALLENGE: "AuthenticationChallenge",
  AUTH_CHALLENGE_PASS: "AuthenticationChallengePass",
  AUTH_CHALLENGE_FAIL: "AuthenticationChallengeFail",
  EMAIL_UPDATE: "EmailUpdate",
  PASSWORD_UPDATE: "PasswordUpdate",
  TWO_FACTOR_DISABLE: "TwoFactorDisable",
  PASSWORD_RESET_REQUEST: "PasswordResetRequest",
  PASSWORD_RESET: "PasswordReset",
  PASSWORD_RESET_FAIL: "PasswordResetFail"
});


module.exports = EventTypes;