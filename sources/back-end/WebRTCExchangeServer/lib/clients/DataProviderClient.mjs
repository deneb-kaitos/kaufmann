import util from 'util';
import {
  DataProviderClientInterpreter,
} from './DataProviderClientMachine/DataProviderClientMachine.mjs';
import {
  WebsocketCloseCodes,
} from '../constants/WebsocketCloseCodes.mjs';

const debuglog = util.debuglog('DataProviderClient');

/**
 * 1. connect to WSS
 * 2. retrieve own ID ( this will be the PIN ) from the WSS
 * 3. open WebRTC connection ???
 */

let client = null;
let rtcPeerConnection = null;
let rtcDataChannel = null;
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
const handleOpen = (openEvent) => {
  debuglog('DataProviderClient.handleOpen');
  // openEvent.target - ws

  DataProviderClientInterpreter.send({
    type: `ws:${openEvent.type}`,
    payload: null,
  });
};
const establishRTC = async () => {
  if (rtcPeerConnection !== null) {
    throw Error('rtcPeerConnection is already established');
  }

  rtcPeerConnection = new RTCPeerConnection();
  rtcDataChannel = rtcPeerConnection.createDataChannel('rtcDataChannel');

  rtcDataChannel.addEventListener('open', (rtcDataChannelOpenEvent) => {
    debuglog('rtcDataChannel on:open', rtcDataChannelOpenEvent);
  });
  rtcDataChannel.addEventListener('close', (rtcDataChannelCloseEvent) => {
    debuglog('rtcDataChannel on:close', rtcDataChannelCloseEvent);
  });
  rtcDataChannel.addEventListener('error', (rtcDataChannelErrorEvent) => {
    debuglog('rtcDataChannel on:error', rtcDataChannelErrorEvent);
  });
  rtcDataChannel.addEventListener('message', (rtcDataChannelMessageEvent) => {
    debuglog('rtcDataChannel on:message', rtcDataChannelMessageEvent);
  });

  const offer = await rtcPeerConnection.createOffer();
  await rtcPeerConnection.setLocalDescription(offer);

  DataProviderClientInterpreter.send({
    type: rtcPeerConnection.localDescription.constructor.name,
    payload: rtcPeerConnection.localDescription,
  });
};
const handleMessage = ({ data }) => {
  const message = JSON.parse(decoder.decode(data));

  const {
    type,
    payload,
  } = message;

  switch (type) {
    case 'id': {
      DataProviderClientInterpreter.send({
        type,
        payload,
      });

      raiseEvent(type, payload);

      break;
    }
    case 'connection-established': {
      DataProviderClientInterpreter.send({
        type,
        payload,
      });

      establishRTC();

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

DataProviderClientInterpreter
  .onTransition((state) => {
    debuglog('.onTransition:', state.value);
  });

export const DataProviderClient = Object.freeze({
  connect,
  disconnect,
  addEventListener,
  removeAllListeners,
});
