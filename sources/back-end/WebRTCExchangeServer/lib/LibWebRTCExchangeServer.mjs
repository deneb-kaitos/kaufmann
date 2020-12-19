import μWs from 'uWebSockets.js';
import {
  HTTPCloseCodes,
} from './HTTPCloseCodes.mjs';

export class LibWebRTCExchangeServer {
  #config = {};
  #server = null;
  #handle = null;

  constructor(config = null) {
    if (config === null) {
      throw new ReferenceError('config is undefined');
    }

    // TODO: use ajv for validation
    if (Object.getOwnPropertyNames(config).length === 0) {
      throw new TypeError('config is empty');
    }

    this.#config = Object.freeze(Object.assign({}, config));
  }

  async start() {
    this.#server = μWs
      .App({})
      .ws('/*', {
        compression: μWs.SHARED_COMPRESSOR,
        maxPayloadLength: 16 * 1024 * 1024,
        idleTimeout: 0,
        upgrade: (res, req, context) => {
          res.onAborted(() => {
            res.aborted = true;
          });

          const xTOKEN = req.getHeader('x-token'); // low case always

          if (xTOKEN.length === 0) {
            return res.end(JSON.stringify({
              code: HTTPCloseCodes.UNAUTHORIZED,
              message: 'no token',
            }));
          }

          if (!res.aborted) {
            res.upgrade(
              { url: req.getUrl() },
              req.getHeader('sec-websocket-key'),
              req.getHeader('sec-websocket-protocol'),
              req.getHeader('sec-websocket-extensions'),
              context,
            );
          }
        },
        open: (ws) => {},
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
  }
}
