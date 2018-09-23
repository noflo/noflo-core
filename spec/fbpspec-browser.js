const fbpspec = require('fbp-spec');

const nodeRuntime = {
  label: 'NoFlo node.js',
  description: '',
  type: 'noflo',
  protocol: 'websocket',
  secret: '',
  address: 'ws://localhost:3569',
  id: '7807f4d8-63e0-4a89-a577-2770c14f8106',
  command: './node_modules/.bin/noflo-runtime-headless --file browser/noflo-core.js',
};

fbpspec.mocha.run(nodeRuntime, './spec', {
  fixturetimeout: 20000,
  commandTimeout: 60000,
});
