import util from 'util';
import {
  Machine,
  interpret,
  assign,
} from 'xstate';

const debuglog = util.debuglog('DataProviderClientMachine');

const DataProviderClientMachine = Machine({
  id: 'DataProviderClientMachine',
  initial: 'uninitialized',
  context: {
    id: null,
  },
  states: {
    uninitialized: {
      entry: ['log'],
      on: {
        'ws:open': {
          target: 'wsOpen',
        },
        'ws:error': {
          target: 'wsError',
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
      entry: ['log'],
      on: {
        'ws:id': {
          actions: [
            assign({ id: (context, event) => event.payload }),
          ],
          target: 'wsMessage',
        },
        'ws:error': {
          target: 'wsError',
        },
      },
    },
    wsMessage: {
      entry: ['log'],
      // always: [
      //   {
      //     target: 'finalOK',
      //   },
      // ],
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
