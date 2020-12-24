import util from 'util';
import {
  Machine,
  assign,
  interpret,
} from 'xstate';

const debuglog = util.debuglog('LibWebRTCExchangeServerSpecMachine');

let LibWebRTCExchangeServerSpecInterpreter = null;

const setupDataProvider = (context) => new Promise((resolve, reject) => {
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
  context.wss = new context.wss(context.configs.wss);

  return context.wss.start();
};

const stopWsServer = (context) => context.wss.stop()

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
        src: (context, event) => startWsServer(context),
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
        src: (context, event) => setupDataProvider(context),
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
        src: (context, event) => stopWsServer(context),
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
