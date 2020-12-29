import util from 'util';
import {
  Machine,
  interpret,
  assign,
} from 'xstate';
import {
  DataProviderWebsocketInterpreter,
} from './DataProviderWebsocketMachine.mjs';

const debuglog = util.debuglog('DataProviderClientMachine');

const DataProviderClientMachine = Machine({
  id: 'DataProviderClientMachine',
  initial: 'uninitialized',
  context: {
    id: null,
  },
  states: {
    uninitialized: {
      invoke: {
        id: 'DataProviderWebsocketInterpreter',
        src: DataProviderWebsocketInterpreter,
        onDone: {
          
        },
      },
    },
    wsError: {
      entry: ['error'],
      always: [
        {
          target: 'finalER',
        },
      ],
    },
    wsOpen: {
      on: {
        id: {
          actions: [
            assign({ id: (context, event) => event.payload }),
            'log',
          ],
          target: 'handleWebRTC',
        },
        'ws:error': {
          target: 'wsError',
        },
      },
    },
    handleWebRTC: {
      on: {
        'connection-established': {
          actions: ['log'],
        },
        'RTCSessionDescription': {
          actions: [
            assign({
              rtcSessionDescription: (context, event) => event.payload
            }),
            'log',
          ],
        },
      },
    },
    finalOK: {
      entry: ['log'],
      type: 'final',
    },
    finalER: {
      entry: ['error'],
      type: 'final',
    },
  },
}, {
  actions: {
    log: (context, event) => {
      const { type } = event;
      let { payload } = event;

      if (payload && Buffer.isBuffer(payload)) {
        payload = JSON.parse(Buffer.from(payload).toString()) ?? '';
      }

      debuglog('LOG:', type, payload, context);
    },
    error: (context, event) => {
      debuglog('ERR:', event, context);
    },
  },
});

export const DataProviderClientInterpreter = interpret(DataProviderClientMachine);
