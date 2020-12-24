import util from 'util';
import μWs from 'uWebSockets.js';
import generate from 'nanoid-generate';
import {
  HTTPCloseCodes,
} from './constants/HTTPCloseCodes.mjs';
import {
  upgradeHandler,
} from './handlers/upgradeHandler.mjs';
import {
  WsConstants,
} from './constants/WsConstants.mjs';
import {
  handleMessage,
} from './handlers/handleMessage.mjs';

const debuglog = util.debuglog('uWs');

export class LibWebRTCExchangeServer {
  #config = {};
  #server = null;
  #handle = null;
  #sockets = null;
  #encoder = null;
  #decoder = null;

  constructor(config = null) {
    if (config === null) {
      throw new ReferenceError('config is undefined');
    }

    // TODO: use ajv for validation
    if (Object.keys(config).length === 0) {
      throw new TypeError('config is empty');
    }

    this.#config = Object.freeze(Object.assign({}, config));
    this.#sockets = new Map();
    this.#encoder = new TextEncoder();
    this.#decoder = new TextDecoder();
  }

  get isRunning() {
    return this.#handle !== null;
  }

  async start() {
    if (this.#server !== null) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.#server = μWs
        .App({})
        .ws('/*', {
          compression: μWs.SHARED_COMPRESSOR,
          maxPayloadLength: 16 * 1024 * 1024,
          idleTimeout: 4,
          upgrade: (res, req, context) => upgradeHandler(res, req, context, this.#sockets),
          open: (ws) => {
            ws[WsConstants.key] = {
              ...ws[WsConstants.key],
              ...{
                id: generate.nolookalikes(this.#config.pin.length),
              },
            };
  
            this.#sockets.set(ws[WsConstants.key].id, ws);

            debuglog('μWs.open:', ws[WsConstants.key], (ws[WsConstants.key]).id);

            if ((ws[WsConstants.key]).credential.type === 'token') {
              const binaryMessage = this.#encoder.encode(JSON.stringify({
                type: 'id',
                payload: (ws[WsConstants.key]).id,
              }));
              const isBinary = true;
              const shouldCompress = false;
  
              ws.send(binaryMessage, isBinary, shouldCompress);
            }
          },
          message: handleMessage,
          close: (ws, code, message) => {
            debuglog('close', code, this.#decoder.decode(message));
  
            this.#sockets.delete((ws[WsConstants.key]).id);
          },
        })
        .any('/*', (res, req) => {
          res.end('nothing here');
        })
        .listen(this.#config.port, (handle) => {
          if (handle) {
            this.#handle = handle ?? null;

            debuglog(`listening on port ${this.#config.port}`);

            return resolve();
          } else {
            return reject(new Error(`failed to listen on port ${this.#config.port}`));
          }
        });
    });

  }

  async stop() {
    if (this.#handle) {
      μWs.us_listen_socket_close(this.#handle);

      this.#handle = null;
    }

    this.#config = null;
    this.#server = null;
    this.#sockets = null;
    this.#encoder = null;
    this.#decoder = null;
  }
}
