import util from 'util';
import {
  Machine,
  interpret,
} from 'xstate';

const debuglog = util.debuglog('LibWebRTCExchangeServerSpecMachine');

// eslint-disable-next-line import/no-mutable-exports
let LibWebRTCExchangeServerSpecInterpreter = null;

const setupDataProvider = (context) => new Promise((resolve) => {
  context.dataProvider.addEventListener('id', (payload) => {
    debuglog('context.dataProvider::on id', payload);

    LibWebRTCExchangeServerSpecInterpreter.send({
      type: 'id',
      payload,
    });
  });

  const wsAddress = context.configs.ws.address;
  const wsProtocols = context.configs.ws.protocols;
  const wsConfig = context.configs.dataProvider;

  context.dataProvider.connect(wsAddress, wsProtocols, wsConfig);

  resolve();
});

const startWsServer = (context) => {
  // eslint-disable-next-line new-cap
  context.wss = new context.wss(context.configs.wss);

  return context.wss.start();
};

const stopWsServer = (context) => context.wss.stop();

const LibWebRTCExchangeServerSpecMachine = Machine({
  id: 'LibWebRTCExchangeServerSpecMachine',
  context: {
    dataProvider: null,
    dataConsumer: null,
    configs: null,
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
        src: (context) => setupDataProvider(context),
        onDone: {
          target: 'awaitId',
        },
        onError: {
          target: 'finalER',
        },
      },
      exit: ['logExit'],
    },
    awaitId: {
      on: {
        id: {
          actions: ['log'],
        },
      },
    },
    stopWsServer: {
      entry: ['logEntry'],
      invoke: {
        id: 'stopWsServer',
        src: (context) => stopWsServer(context),
        onDone: {
          target: 'finalOK',
        },
        onError: {
          target: 'finalER',
        },
      },
      exit: ['logExit'],
    },
    finalOK: {
      entry: ['logEntry'],
      type: 'final',
      exit: ['logExit'],
    },
    finalER: {
      entry: ['logEntry'],
      type: 'final',
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
  },
});

LibWebRTCExchangeServerSpecInterpreter = (context = null) => interpret(
  LibWebRTCExchangeServerSpecMachine.withContext(context),
);

export {
  LibWebRTCExchangeServerSpecInterpreter,
};
