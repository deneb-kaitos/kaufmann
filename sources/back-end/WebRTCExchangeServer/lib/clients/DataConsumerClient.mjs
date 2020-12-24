import util from 'util';
import {
  WebsocketCloseCodes,
} from '../constants/WebsocketCloseCodes.mjs';

const debuglog = util.debuglog('DataConsumerClient');

/**
 * 1. connect to WSS
 * 2. retrieve own ID ( this will be the PIN ) from the WSS
 * 3. open WebRTC connection ???
 */

let client = null;
let id = null;
const events = new Map();

const decoder = new TextDecoder();
// const encoder = new TextEncoder();

const raiseEvent = (type, payload) => {
  if (events.has(type)) {
    events.get(type).forEach((handler) => handler(payload));
  }
};

const handleUnexpectedResponse = (unexpectedResponseEvent) => {
  debuglog('handleUnexpectedResponse', unexpectedResponseEvent);
};
const handleError = (errorEvent) => {
  debuglog('handleError', errorEvent);
};
const handleClose = (closeEvent) => {
  debuglog('handleClose', closeEvent);
};
const handleOpen = (/* openEvent */) => {
  debuglog('handleOpen'); // openEvent.target - ws
};
const handleMessage = ({
  data,
}) => {
  const {
    type,
    payload,
  } = JSON.parse(decoder.decode(data));

  switch (type) {
    case 'pin': {
      // eslint-disable-next-line no-unused-vars
      id = payload;

      raiseEvent(type, payload);

      break;
    }
    default: {
      debuglog('handleMessage::unhandled event', type, payload);

      break;
    }
  }
};

const connect = (wsAddress, wsProtocols, wsClientConfig) => new Promise((resolve) => {
  if (client !== null && [WebSocket.CONNECTING, WebSocket.OPEN].includes(client.readyState)) {
    return resolve();
  }

  client = new WebSocket(
    wsAddress,
    wsProtocols,
    wsClientConfig,
  );

  client.addEventListener('unexpected-response', handleUnexpectedResponse);
  client.addEventListener('error', handleError);
  client.addEventListener('close', handleClose);
  client.addEventListener('open', handleOpen);
  client.addEventListener('message', handleMessage);

  return undefined;
});

const removeAllListeners = () => {
  events.clear();
};

const disconnect = () => {
  removeAllListeners();

  if (client) {
    client.removeAllListeners();
    client.close(WebsocketCloseCodes.CLOSE_NORMAL, 'bye');

    client = null;
  }
};

const addEventListener = (event, handler) => {
  if (events.has(event) === false) {
    events.set(event, []);
  }

  events.get(event).push(handler);
};

export const DataConsumerClient = Object.freeze({
  connect,
  disconnect,
  addEventListener,
  removeAllListeners,
});
