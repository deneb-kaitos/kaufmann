import util from 'util';
import {
  Machine,
  interpret,
  assign,
  sendParent,
} from 'xstate';

/*
  this just sends commands to the parent machine (via sendParent; w/ function names that should be invoked)
*/

const debuglog = util.debuglog('WebsocketMachine');

const handleMessage = (context, event) => new Promise((resolve, reject) => {
  try {
    debuglog(context, event);

    resolve();
  } catch (error) {
    reject(error);
  }
});

const DataProviderWebsocketMachine = Machine({
  id: 'WebsocketMachine',
  initial: 'uninitialized',
  context: null,
  states: {
    uninitialized: {
      on: {
        start: {
          actions: sendParent('ws:connect', {}),
        },
        open: {
          target: 'open',
        },
        error: {
          target: 'uninitialized',
        },
        'unexpected-response': {
          target: 'uninitialized',
        },
      },
    },
    open: {
      on: {
        message: {
          invoke: {
            id: 'handleMessage',
            src: async (context, event) => await handleMessage(context, event),
            onDone: {
              actions: assign((context, event) => event.data),
            },
            onError: {
              actions: assign({ error: (context, event) => event.data }),
            },
          },
        },
        close: {
          target: 'close',
        },
        error: {
          target: 'uninitialized',
        },
        'unexpected-response': {
          target: 'open',
        },
      },
    },
    close: {
      always: [
        {
          target: 'destroy',
        },
      ],
    },
    destroy: {
      type: 'final',
    },
  },
}, {
  actions: {},
  activities: {},
});

export const DataProviderWebsocketInterpreter = interpret(DataProviderWebsocketMachine);
