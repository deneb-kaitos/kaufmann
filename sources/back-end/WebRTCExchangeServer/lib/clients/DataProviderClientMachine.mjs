import util from 'util';
import {
  Machine,
  interpret,
} from 'xstate';

const debuglog = util.debuglog('DataProviderClientMachine');

const DataProviderClientMachine = Machine({
  id: 'DataProviderClientMachine',
  initial: 'uninitialized',
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
        'ws:message': {
          target: 'wsMessage',
        },
        'ws:error': {
          target: 'wsError',
        },
      },
    },
    wsMessage: {
      entry: ['log'],
      always: [
        {
          target: 'finalOK',
        }
      ],
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
      let { type, payload } = event;

      if (payload && Buffer.isBuffer(payload)) {
        payload = JSON.parse(Buffer.from(payload).toString());
      }

      debuglog('LOG:', type, payload ? payload : '', context ? context : '');
    },
    error: (context, event) => {
      debuglog('ERR:', event, context ? context : '');
    },
  },
});

export const DataProviderClientInterpreter = interpret(DataProviderClientMachine);
