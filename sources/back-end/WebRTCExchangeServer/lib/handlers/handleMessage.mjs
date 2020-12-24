import util from 'util';
import {
  WebsocketCloseCodes,
} from '../constants/WebsocketCloseCodes.mjs';

const debuglog = util.debuglog('uWs');
const decoder = new TextDecoder();

export const handleMessage = (ws, message, isBinary) => {
  if (isBinary === false) {
    debuglog('message is not binary');

    return ws.end(WebsocketCloseCodes.CLOSE_UNSUPPORTED, 'non-binary message');
  }

  const messageObject = JSON.parse(decoder.decode(message));

  switch (messageObject.type) {
    default: {
      debuglog('handleMessage: unknown message type', messageObject);

      break;
    }
  }

  return undefined;
};
