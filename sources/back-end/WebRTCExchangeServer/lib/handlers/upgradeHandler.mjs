import util from 'util';
import {
  AsyncLocalStorage,
} from 'async_hooks';
import {
  HTTPCloseCodes,
} from '../constants/HTTPCloseCodes.mjs';
import {
  WebsocketCloseCodes,
} from '../constants/WebsocketCloseCodes.mjs';
import {
  isTokenValid,
} from './isTokenValid.mjs';
import {
  WsConstants,
} from '../constants/WsConstants.mjs';

const debuglog = util.debuglog('uWs');
const als = new AsyncLocalStorage();

const noCredentialsResponse = JSON.stringify({
  code: HTTPCloseCodes.UNAUTHORIZED,
  message: 'neither token nor pin presented',
});
const invalidTokenResponse = JSON.stringify({
  code: HTTPCloseCodes.UNAUTHORIZED,
  message: 'invalid token',
});
const invalidPinResponse = JSON.stringify({
  code: HTTPCloseCodes.UNAUTHORIZED,
  message: 'invalid pin',
});
const protocolViolationResponse = JSON.stringify({
  code: HTTPCloseCodes.UNAUTHORIZED,
  message: 'both the token and the pin are present',
});

const checkCanProceed = () => {
  const token = als.getStore().get('x-token').length === 0 ? null : als.getStore().get('x-token');
  const pin = als.getStore().get('x-pin').length === 0 ? null : als.getStore().get('x-pin');
  const sockets = als.getStore().get('sockets');

  if (token === null && pin === null) {
    throw new Error(noCredentialsResponse);
  }

  if (token !== null && pin !== null) {
    throw new Error(protocolViolationResponse);
  }

  if (token !== null && isTokenValid(token) === false) {
    throw new Error(invalidTokenResponse);
  }

  if (pin !== null && sockets.has(pin) === false) {
    throw new Error(invalidPinResponse);
  }
};

const resolveCredentials = () => {
  const token = als.getStore().get('x-token').length === 0 ? null : als.getStore().get('x-token');
  const pin = als.getStore().get('x-pin').length === 0 ? null : als.getStore().get('x-pin');

  // TODO: see this https://snyk.io/blog/node-js-timing-attack-ccc-ctf/
  // eslint-disable-next-line security/detect-possible-timing-attacks
  if (token !== null) {
    return Object.freeze({
      [WsConstants.key]: {
        credential: {
          type: 'token',
          payload: token,
        },
      },
    });
  }

  if (pin !== null) {
    return Object.freeze({
      [WsConstants.key]: {
        credential: {
          type: 'pin',
          payload: pin,
        },
      },
    });
  }

  return null;
};

export const upgradeHandler = (res, req, context, sockets) => {
  als.run(new Map(), () => {
    debuglog('upgradeHandler');

    res.onAborted(() => {
      res.aborted = true;
    });

    als.getStore().set('x-token', req.getHeader('x-token'));
    als.getStore().set('x-pin', req.getHeader('x-pin'));
    als.getStore().set('sockets', sockets);

    try {
      checkCanProceed();

      if (!res.aborted) {
        res.upgrade(
          {
            ...resolveCredentials(),
          },
          req.getHeader('sec-websocket-key'),
          req.getHeader('sec-websocket-protocol'),
          req.getHeader('sec-websocket-extensions'),
          context,
        );
      }
    } catch (validationError) {
      return res.end(WebsocketCloseCodes.SERVER_ERROR, validationError.message);
    }

    return undefined;
  });
};
