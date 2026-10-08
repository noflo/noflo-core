# noflo-core

NoFlo Essentials — core components for [NoFlo](https://noflojs.org)

## Components

- `core/Split` — forwards each packet to all connected output ports
- `core/Merge` — forwards packets from multiple input ports to the output
- `core/Repeat` — forwards packets unchanged
- `core/RepeatAsync` — forwards packets on the next tick
- `core/RepeatDelayed` — forwards packets after a configurable delay
- `core/Copy` — deep-copies incoming objects (Web-standard `structuredClone`; non-cloneables pass through by reference)
- `core/Drop` — drops every packet
- `core/Output` — logs packets to the console and forwards them
- `core/Kick` — generates a single packet to start a network
- `core/SendNext` — releases one buffered packet per bang
- `core/DisconnectAfterPacket` — makes each data packet a stream of its own
- `core/Callback` — calls a Node.js-style callback for each packet
- `core/MakeFunction` — evaluates a function source against incoming data
- `core/ReadEnv` — reads an environment variable
- `core/ReadGlobal` — reads a global variable via `globalThis`
- `core/RunInterval` — emits a bang at a configurable interval, per scope
- `core/RunTimeout` — emits a bang after a configurable timeout, per scope

## Usage

Components are discovered automatically by NoFlo 2.x on Node.js. Example in FBP:

```
Read(files/ReadFile) OUT -> IN Split(core/Split) OUTPUT -> IN Display
```

## Development

Install dependencies and run the test suite:

```
npm ci
npm test
```
