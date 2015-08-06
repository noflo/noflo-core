fbpspec = require 'fbp-spec'

nodeRuntime =
  label: "NoFlo node.js"
  description: ""
  type: "noflo"
  protocol: "websocket"
  secret: 'notasecret'
  address: "ws://localhost:3333"
  id: "7807f4d8-63e0-4a89-a577-2770c14f8106"
  command: 'noflo-nodejs --verbose --debug  --catch-exceptions=false --secret notasecret'

fbpspec.mocha.run nodeRuntime, './spec', { fixturetimeout: 20000 }
