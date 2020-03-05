import ModifyHeaders from './modify-headers';
import DeleteHeaders from './delete-headers';
import BlacklistIp from './blacklist-ip';
import WhitelistIp from './whitelist-ip';
import BlockRequest from './block-request';
import ChallengeRequest from './challenge-request';
import DeleteBlacklistedIp from './delete-blacklisted-ip';

export const processors = {
  ModifyHeaders,
  DeleteHeaders,
  BlacklistIp,
  DeleteBlacklistedIp,
  WhitelistIp,
  BlockRequest,
  ChallengeRequest
}
