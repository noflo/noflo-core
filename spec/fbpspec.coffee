fbpspec = require 'fbp-spec'

nodeRuntime =
  label: "NoFlo node.js"
  description: ""
  type: "noflo"
  protocol: "websocket"
  address: "ws://localhost:3333"
  id: "7807f4d8-63e0-4a89-a577-2770c14f8106"
  command: 'noflo-nodejs'

fbpspec.mocha.run nodeRuntime, './spec/Core.yaml', {}
