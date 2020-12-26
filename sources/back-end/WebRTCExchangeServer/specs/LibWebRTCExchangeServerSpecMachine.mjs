import util from 'util';
import {
  Machine,
  interpret,
  assign,
} from 'xstate';

const debuglog = util.debuglog('LibWebRTCExchangeServerSpecMachine');

// eslint-disable-next-line import/no-mutable-exports
let LibWebRTCExchangeServerSpecInterpreter = null;

const startWsServer = (context) => {
  // eslint-disable-next-line new-cap
  context.wss = new context.wss(context.configs.wss);

  return context.wss.start();
};

const setupDataProvider = (context) => new Promise((resolve) => {
  context.dataProvider.addEventListener('id', (payload) => {
    resolve(payload);
  });

  const wsAddress = context.configs.ws.address;
  const wsProtocols = context.configs.ws.protocols;
  const wsConfig = context.configs.dataProvider;

  context.dataProvider.connect(wsAddress, wsProtocols, wsConfig);
});

const setupDataConsumer = async (context) => {
  const wsAddress = context.configs.ws.address;
  const wsProtocols = context.configs.ws.protocols;
  const wsConfig = {
    ...context.configs.dataConsumer,
    headers: {
      'x-pin': context.pin,
    },
  };

  context.dataConsumer.connect(wsAddress, wsProtocols, wsConfig);
};

const stopWsServer = (context) => context.wss.stop();

const LibWebRTCExchangeServerSpecMachine = Machine({
  id: 'LibWebRTCExchangeServerSpecMachine',
  context: {
    dataProvider: null,
    dataConsumer: null,
    configs: null,
    pin: null,
  },
  initial: 'uninitialized',
  states: {
    uninitialized: {
      always: [
        {
          target: 'startWsServer',
        },
      ],
    },
    startWsServer: {
      entry: ['logEntry'],
      invoke: {
        id: 'startWsServer',
        src: (context) => startWsServer(context),
        onDone: {
          target: 'setupDataProvider',
        },
        onError: {
          target: 'finalER',
        },
      },
      exit: ['logExit'],
    },
    setupDataProvider: {
      entry: ['logEntry'],
      invoke: {
        id: 'setupDataProvider',
        src: async (context) => await setupDataProvider(context),
        onDone: {
          target: 'setupDataConsumer',
          actions: assign({ pin: (context, event) => event.data }),
        },
        onError: {
          target: 'finalER',
        },
      },
      exit: ['logExit'],
    },
    //
    setupDataConsumer: {
      entry: ['logEntry'],
      invoke: {
        id: 'setupDataConsumer',
        src: async (context) => await setupDataConsumer(context),
        onDone: {
          target: 'exchangeToken'
        },
        onError: {
          target: 'finalER',
        },
      },
      exit: ['logExit'],
    },
    //
    exchangeToken: {
      entry: ['logEntry'],
      exit: ['logExit'],
    },
    // },
    finalOK: {
      entry: ['logEntry'],
      type: 'final',
      always: {
        actions: ['cleanUp'],
      },
      exit: ['logExit'],
    },
    finalER: {
      entry: ['logEntry'],
      type: 'final',
      always: {
        actions: ['cleanUp'],
      },
      exit: ['logExit'],
    },
  },
}, {
  actions: {
    log: (context, event) => {
      debuglog(event, context);
    },
    logEntry: (context, event) => {
      debuglog('entry:', event.type);
    },
    logExit: (context, event) => {
      debuglog('exit:', event.type);
    },
    cleanUp: (context, event) => {
      debuglog('cleanUp', context);
    },
  },
});

LibWebRTCExchangeServerSpecInterpreter = (context = null) => interpret(
  LibWebRTCExchangeServerSpecMachine.withContext(context),
);

export {
  LibWebRTCExchangeServerSpecInterpreter,
};
