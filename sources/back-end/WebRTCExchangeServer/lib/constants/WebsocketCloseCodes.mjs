// https://github.com/Luka967/websocket-close-codes

export const WebsocketCloseCodes = Object.freeze({
  CLOSE_NORMAL: 1000,
  CLOSE_UNSUPPORTED: 1003, // binary-only endpoint received text frame
  SERVER_ERROR: 1011,
});
