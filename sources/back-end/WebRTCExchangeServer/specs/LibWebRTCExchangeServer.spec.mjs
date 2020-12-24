import util from 'util';
import mocha from 'mocha';
import chai from 'chai';
import WebSocket from 'ws';
import {
  nanoid,
} from 'nanoid';
import {
  WebsocketCloseCodes,
} from '../lib/constants/WebsocketCloseCodes.mjs';
import {
  LibWebRTCExchangeServer,
} from '../lib/LibWebRTCExchangeServer.mjs';
import {
  DataProviderClient,
} from '../lib/clients/DataProviderClient.mjs';
import {
  DataConsumerClient,
} from '../lib/clients/DataConsumerClient.mjs';
import {
  LibWebRTCExchangeServerSpecInterpreter,
} from './LibWebRTCExchangeServerSpecMachine.mjs';
import {
  interpret,
} from 'xstate';

const debuglog = util.debuglog('specs');
const {
  describe,
  before,
  after,
  it,
} = mocha;
const {
  expect,
} = chai;

describe('LibWebRTCExchangeServer', () => {
  const LibWebRTCExchangeServerConfig = Object.freeze({
    port: 9091,
    pin: {
      length: 6,
    },
  });
  const wsClientConfig = Object.freeze({
    handshakeTimeout: 100,
    perMessageDeflate: false,
    headers: {
      'x-token': (new Buffer(nanoid(64))).toString('base64'),
    },
  });
  const wsAddress = `ws://localhost:${LibWebRTCExchangeServerConfig.port}/`;
  const wsProtocols = Object.freeze([]);
  let libWebRTCExchangeServer = null;
  const destroyClient = (client) => {
    client.removeAllListeners();
  
    client = null;
  };
  const ok = (client, resolve) => {
    destroyClient(client);

    return resolve();
  };

  const fail = (error, client, reject) => {
    destroyClient(client);

    return reject(error);
  };


  // before(async () => {
  //   libWebRTCExchangeServer = new LibWebRTCExchangeServer(LibWebRTCExchangeServerConfig);

  //   return libWebRTCExchangeServer.start();
  // });

  // after(async () => {
  //   if (libWebRTCExchangeServer) {
  //     await libWebRTCExchangeServer.stop();

  //     libWebRTCExchangeServer = null;
  //   }
  // });

  it('should pass Macaroon from DataProviderClient to DataAcceptorClient', () => new Promise((resolve, reject) => {
    const WebRTCExchangeServerAccessToken = (new Buffer(nanoid(64))).toString('base64');
    const configs = {
      dataProvider: {
        handshakeTimeout: 100,
        perMessageDeflate: false,
        headers: {
          'x-token': WebRTCExchangeServerAccessToken,
        },
      },
      dataConsumer: {
        handshakeTimeout: 100,
        perMessageDeflate: false,
        headers: {
          'x-pin': null,
        },
      },
      ws: {
        address: wsAddress,
        protocols: wsProtocols,
      },
      wss: LibWebRTCExchangeServerConfig,
    };
    const libWebRTCExchangeServerSpecInterpreter = LibWebRTCExchangeServerSpecInterpreter({
      dataProvider: DataProviderClient,
      dataConsumer: DataConsumerClient,
      wss: LibWebRTCExchangeServer,
      configs,
    });

    libWebRTCExchangeServerSpecInterpreter
      // .onChange((data) => {
      //   debuglog('TEST.onChange', data);
      // })
      .onDone((data) => {
        debuglog('TEST.onDone', data);
      })
      // .onEvent((event) => {
      //   debuglog('TEST.onEvent', event);
      // })
      // .onSend((sendEvent) => {
      //   debuglog('TEST.onSend', sendEvent);
      // })
      .onStop(() => {
        debuglog('TEST.onStop');

        resolve();
      })
      // .onTransition((state) => {
      //   debuglog('TEST.onTransition', state.value);
      // })
      .start();
  })).timeout(500);
});
