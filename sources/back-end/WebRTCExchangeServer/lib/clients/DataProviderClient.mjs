import {
  WebsocketCloseCodes,
} from '../constants/WebsocketCloseCodes.mjs';

/**
 * 1. connect to WSS
 * 2. retrieve own ID ( this will be the PIN ) from the WSS
 * 3. open WebRTC connection ???
 */

let client = null;
let id = null;
const events = new Map();

const decoder = new TextDecoder();
const encoder = new TextEncoder();

const raiseEvent = (type, payload) => {
  if (events.has(type)) {
    events.get(type).forEach((handler) => handler(payload));
  }
};

const handleUnexpectedResponse = () => {};
const handleError = () => {};
const handleClose = (closeEvent) => {
  // console.debug('handleClose', closeEvent);
};
const handleOpen = (openEvent) => {
  console.debug('handleOpen'); // openEvent.target - ws
};
const handleMessage = ({ data }) => {
  const { type, payload } = JSON.parse(decoder.decode(data));

  switch (type) {
    case 'pin': {
      raiseEvent(type, payload);

      break;
    }
    default: {
      console.debug('handleMessage', type, payload);

      break;
    }
  }
};

const connect = (wsAddress, wsProtocols, wsClientConfig) => {
  return new Promise(async (resolve, reject) => {
    if (client !== null && [WebSocket.CONNECTING, WebSocket.OPEN].includes(client.readyState)) {
      return resolve();
    }

    client = null;
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
  });
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

const removeAllListeners = () => {
  events.clear();
};

export const DataProviderClient = Object.freeze({
  connect,
  disconnect,
  addEventListener,
  removeAllListeners,
});
