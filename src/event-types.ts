enum EventTypes {
  LOG_IN = "sn.user.login",
  LOG_IN_CHALLENGE = "sn.user.login.challenge",
  LOG_IN_FAILURE = "sn.user.login.failure",
  LOG_OUT = "sn.user.logout",
  SIGN_UP = "sn.user.signup",
  AUTH_CHALLENGE = "sn.user.auth.challange",
  AUTH_CHALLENGE_SUCCESS = "sn.user.auth.challange.success",
  AUTH_CHALLENGE_FAILURE = "sn.user.auth.challange.failure",
  TWO_FACTOR_DISABLE = "sn.user.2fa.disable",
  EMAIL_UPDATE = "sn.user.email.update",
  PASSWORD_RESET = "sn.user.password.reset",
  PASSWORD_RESET_SUCCESS = "sn.user.password.reset.success",
  PASSWORD_UPDATE = "sn.user.password.update",
  PASSWORD_RESET_FAILURE = "sn.user.password.reset.failure",
  USER_INVITE = "sn.user.invite",
  ROLE_UPDATE = "sn.user.role.update",
  PROFILE_UPDATE = "sn.user.profile.update",
  PAGE_VIEW = "sn.user.page.view",
};

export default EventTypes;
