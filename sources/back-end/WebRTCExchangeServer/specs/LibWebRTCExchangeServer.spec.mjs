import mocha from 'mocha';
import chai from 'chai';
import WebSocket from 'ws';
import {
  nanoid,
} from 'nanoid';
import {
  WebsocketCloseCodes,
} from '../lib/WebsocketCloseCodes.mjs';
import {
  LibWebRTCExchangeServer,
} from '../lib/LibWebRTCExchangeServer.mjs';

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
  const ClientConfig = Object.freeze({
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


  before(async () => {
    libWebRTCExchangeServer = new LibWebRTCExchangeServer(LibWebRTCExchangeServerConfig);

    return libWebRTCExchangeServer.start();
  });

  after(async () => {
    if (libWebRTCExchangeServer) {
      await libWebRTCExchangeServer.stop();

      libWebRTCExchangeServer = null;
    }
  });

  it('should connect w/ a token', () => new Promise((resolve, reject) => {
      const client = new WebSocket(wsAddress, wsProtocols, ClientConfig);

      client.binaryType = 'nodebuffer';

      const handleOpen = () => {
        client.close(WebsocketCloseCodes.CLOSE_NORMAL, 'bye');
      };
      const handleClose = (closeEvent) => {
        const {
          wasClean,
          code,
        } = closeEvent;

        expect(wasClean).to.be.true;
        expect(code).to.equal(1000);

        return ok(client, resolve);
      };
      const handleError = (errorEvent) => {
        console.debug('handleError', errorEvent);

        return fail(new Error(errorEvent.message), client, reject);
      };
      const handleUnexpectedResponse = (req, res) => {
        console.debug('handleUnexpectedResponse', req, res);
      };

      client.addEventListener('error', handleError);
      client.addEventListener('close', handleClose);
      client.addEventListener('open', handleOpen);
      client.addEventListener('unexpected-response', handleUnexpectedResponse);
  }));
});
