import ModifyHeaders from './modify-headers';
import DeleteHeaders from './delete-headers';
import BlacklistIp from './blacklist-ip';
import BlockRequest from './block-request';

export const processors = {
  ModifyHeaders,
  DeleteHeaders,
  BlacklistIp,
  BlockRequest
}