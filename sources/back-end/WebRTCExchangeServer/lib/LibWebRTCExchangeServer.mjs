import μWs from 'uWebSockets.js';
import {
  customAlphabet,
} from 'nanoid';
import {
  HTTPCloseCodes,
} from './HTTPCloseCodes.mjs';
import {
  upgradeHandler,
} from './handlers/upgradeHandler.mjs';

export class LibWebRTCExchangeServer {
  #config = {};
  #server = null;
  #handle = null;
  #sockets = null;
  #nanoid = null;

  constructor(config = null) {
    if (config === null) {
      throw new ReferenceError('config is undefined');
    }

    // TODO: use ajv for validation
    if (Object.keys(config).length === 0) {
      throw new TypeError('config is empty');
    }

    this.#nanoid = customAlphabet('qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890', config.pin.length);
    this.#config = Object.freeze(Object.assign({}, config));
    this.#sockets = new Map();
  }

  async start() {
    this.#server = μWs
      .App({})
      .ws('/*', {
        compression: μWs.SHARED_COMPRESSOR,
        maxPayloadLength: 16 * 1024 * 1024,
        idleTimeout: 4,
        upgrade: (res, req, context) => upgradeHandler(res, req, context, this.#sockets),
        open: (ws) => {
          ws.__kaufmann__ = {
            id: this.#nanoid(),
          };

          this.#sockets.set(ws.__kaufmann__.id, ws);
        },
        message: (ws, message, isBinary) => {},
        close: (ws, code, message) => {},
      })
      .any('/*', (res, req) => {
        res.end('nothing here');
      })
      .listen(this.#config.port, (handle) => {
        if (handle) {
          this.#handle = handle;
        } else {
          throw new Error(`failed to listen on port ${this.#config.port}`)
        }
      });
  }

  async stop() {
    if (this.#handle) {
      μWs.us_listen_socket_close(this.#handle);

      this.#handle = null;
    }

    this.#config = null;
    this.#nanoid = null;
    this.#server = null;
    this.#sockets = null;
  }
}
