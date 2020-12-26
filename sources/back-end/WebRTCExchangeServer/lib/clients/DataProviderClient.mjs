import util from 'util';
import {
  DataProviderClientInterpreter,
} from './DataProviderClientMachine.mjs';
import {
  WebsocketCloseCodes,
} from '../constants/WebsocketCloseCodes.mjs';

const debuglog = util.debuglog('DataProviderClient');

/**
 * 1. connect to WSS
 * 2. retrieve own ID ( this will be the PIN ) from the WSS
 * 3. open WebRTC connection ???
 */

DataProviderClientInterpreter.onTransition((state) => {
  debuglog('.onTransition:', state.value);
});

let client = null;
// let id = null;
const events = new Map();

const decoder = new TextDecoder();
// const encoder = new TextEncoder();

const raiseEvent = (type, payload) => {
  debuglog('DataProviderClient.raiseEvent:', type, payload);

  if (events.has(type)) {
    events.get(type).forEach((handler) => handler(payload));
  }
};

const handleUnexpectedResponse = (unexpectedResponseEvent) => {
  debuglog('DataProviderClient.handleUnexpectedResponse:', unexpectedResponseEvent);

  DataProviderClientInterpreter.send({
    type: 'ws:unexpected-response',
    payload: unexpectedResponseEvent,
  });
};
const handleError = (errorEvent) => {
  debuglog('DataProviderClient.handleError:', errorEvent);

  DataProviderClientInterpreter.send({
    type: 'ws:error',
    payload: errorEvent,
  });
};
const handleClose = (closeEvent) => {
  debuglog('DataProviderClient.handleClose');

  DataProviderClientInterpreter.send({
    type: 'ws:close',
    payload: closeEvent,
  });
};
const handleOpen = (/* openEvent */) => {
  debuglog('DataProviderClient.handleOpen');
  // openEvent.target - ws

  DataProviderClientInterpreter.send({
    type: 'ws:open',
    payload: null,
  });
};
const handleMessage = ({ data }) => {
  const message = JSON.parse(decoder.decode(data));

  const {
    type,
    payload,
  } = message;

  DataProviderClientInterpreter.send({
    type: `ws:${type}`,
    payload,
  });

  switch (type) {
    case 'id': {
      raiseEvent(type, payload);

      break;
    }
    case 'connection-established': {
      debuglog('connection-established');

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

  DataProviderClientInterpreter.start();

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

  return resolve();
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

  // TODO: what is the proper way to dispose of a machine?
  DataProviderClientInterpreter.stop();
};

const addEventListener = (event, handler) => {
  if (events.has(event) === false) {
    events.set(event, []);
  }

  events.get(event).push(handler);
};

export const DataProviderClient = Object.freeze({
  connect,
  disconnect,
  addEventListener,
  removeAllListeners,
});
