import ModifyHeaders from './modify-headers';
import DeleteHeaders from './delete-headers';
import BlacklistIp from './blacklist-ip';
import WhitelistIp from './whitelist-ip';
import BlockRequest from './block-request';
import ChallengeRequest from './challenge-request';

export const processors = {
  ModifyHeaders,
  DeleteHeaders,
  BlacklistIp,
  WhitelistIp,
  BlockRequest,
  ChallengeRequest
}
