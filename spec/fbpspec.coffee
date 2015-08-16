fbpspec = require 'fbp-spec'

nodeRuntime =
  label: "NoFlo node.js"
  description: ""
  type: "noflo"
  protocol: "websocket"
  secret: 'notasecret'
  address: "ws://localhost:3333"
  id: "7807f4d8-63e0-4a89-a577-2770c14f8106"
  command: './node_modules/.bin/noflo-nodejs --verbose --debug  --catch-exceptions=false --secret notasecret --port=3333 --host=localhost --register=false'

fbpspec.mocha.run nodeRuntime, './spec', { fixturetimeout: 20000 }
