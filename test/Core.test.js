import assert from "node:assert/strict";
import { describe, it } from "node:test";
import * as noflo from "@noflo/noflo";

import { getComponent as getCallback } from "../components/Callback.js";
import { getComponent as getCopy } from "../components/Copy.js";
import { getComponent as getDrop } from "../components/Drop.js";
import { getComponent as getMakeFunction } from "../components/MakeFunction.js";
import { getComponent as getReadEnv } from "../components/ReadEnv.js";
import { getComponent as getReadGlobal } from "../components/ReadGlobal.js";
import { getComponent as getSplit } from "../components/Split.js";

/**
 * Waits for the next IP on a socket matching the predicate.
 *
 * Attach the returned promise before sending any IPs: the activation can
 * complete synchronously inside the post that completes preconditions.
 * @param {import("@noflo/noflo").internalSocket.InternalSocket} socket
 * @param {(ip: import("@noflo/noflo").IP) => boolean} predicate
 * @returns {Promise<import("@noflo/noflo").IP>}
 */
const waitUntil = (socket, predicate) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Timed out waiting for IP"));
    }, 2000);
    /** @param {CustomEvent} event */
    const listener = (event) => {
      const ip = event.detail;
      if (predicate(ip)) {
        cleanup();
        resolve(ip);
      }
    };
    const cleanup = () => {
      clearTimeout(timer);
      socket.removeEventListener("ip", listener);
    };
    socket.addEventListener("ip", listener);
  });

/** @param {import("@noflo/noflo").internalSocket.InternalSocket} socket */
const collect = (socket) => {
  /** @type {import("@noflo/noflo").IP[]} */
  const ips = [];
  socket.addEventListener(
    "ip",
    /** @param {CustomEvent} event */ (event) => {
      ips.push(event.detail);
    },
  );
  return ips;
};

describe("Callback component", () => {
  it("invokes the callback with the received data", async () => {
    const c = getCallback();
    const inSocket = noflo.internalSocket.createSocket();
    const callbackSocket = noflo.internalSocket.createSocket();
    const errorSocket = noflo.internalSocket.createSocket();
    c.inPorts.in.attach(inSocket);
    c.inPorts.callback.attach(callbackSocket);
    c.outPorts.error.attach(errorSocket);
    /** @type {unknown[]} */
    const calls = [];
    try {
      callbackSocket.post(
        new noflo.IP("data", (/** @type {unknown} */ value) =>
          calls.push(value),
        ),
      );
      const done = waitUntil(inSocket, () => false).catch(() => {});
      inSocket.post(new noflo.IP("data", "payload"));
      await done;
      assert.deepEqual(calls, ["payload"]);
    } finally {
      await c.shutdown();
    }
  });

  it("routes callback errors to the error port", async () => {
    const c = getCallback();
    const inSocket = noflo.internalSocket.createSocket();
    const callbackSocket = noflo.internalSocket.createSocket();
    const errorSocket = noflo.internalSocket.createSocket();
    c.inPorts.in.attach(inSocket);
    c.inPorts.callback.attach(callbackSocket);
    c.outPorts.error.attach(errorSocket);
    try {
      callbackSocket.post(
        new noflo.IP("data", () => {
          throw new Error("callback failed");
        }),
      );
      const errorIp = waitUntil(
        errorSocket,
        (ip) => ip.type === "data" || ip.type === "error",
      );
      inSocket.post(new noflo.IP("data", "payload"));
      const ip = await errorIp;
      assert.match(ip.data.message, /callback failed/);
    } finally {
      await c.shutdown();
    }
  });
});

describe("Copy component", () => {
  it("sends a deep copy that is not the same reference", async () => {
    const c = getCopy();
    const inSocket = noflo.internalSocket.createSocket();
    const outSocket = noflo.internalSocket.createSocket();
    c.inPorts.in.attach(inSocket);
    c.outPorts.out.attach(outSocket);
    const original = { hello: "world", list: [1, 2, 3] };
    try {
      const outIp = waitUntil(outSocket, (ip) => ip.type === "data");
      inSocket.post(new noflo.IP("data", original));
      const ip = await outIp;
      assert.deepEqual(ip.data, original);
      assert.notEqual(ip.data, original);
      assert.notEqual(ip.data.list, original.list);
    } finally {
      await c.shutdown();
    }
  });

  it("passes non-cloneable values through by reference", async () => {
    const c = getCopy();
    const inSocket = noflo.internalSocket.createSocket();
    const outSocket = noflo.internalSocket.createSocket();
    c.inPorts.in.attach(inSocket);
    c.outPorts.out.attach(outSocket);
    const fn = () => "unchanged";
    try {
      const outIp = waitUntil(outSocket, (ip) => ip.type === "data");
      inSocket.post(new noflo.IP("data", fn));
      const ip = await outIp;
      assert.equal(ip.data, fn);
    } finally {
      await c.shutdown();
    }
  });
});

describe("Drop component", () => {
  it("consumes packets without forwarding anything", async () => {
    const c = getDrop();
    const inSocket = noflo.internalSocket.createSocket();
    c.inPorts.in.attach(inSocket);
    try {
      // No out port exists; dropping must simply complete the activation
      inSocket.post(new noflo.IP("data", "vanish"));
      await new Promise((resolve) => setTimeout(resolve, 100));
    } finally {
      await c.shutdown();
    }
  });
});

describe("MakeFunction component", () => {
  it("evaluates the function source with the incoming data", async () => {
    const c = getMakeFunction();
    const inSocket = noflo.internalSocket.createSocket();
    const functionSocket = noflo.internalSocket.createSocket();
    const outSocket = noflo.internalSocket.createSocket();
    c.inPorts.in.attach(inSocket);
    c.inPorts.function.attach(functionSocket);
    c.outPorts.out.attach(outSocket);
    try {
      // Control port before firing port
      functionSocket.post(new noflo.IP("data", "return x * 2;"));
      const outIp = waitUntil(outSocket, (ip) => ip.type === "data");
      inSocket.post(new noflo.IP("data", 21));
      const ip = await outIp;
      assert.equal(ip.data, 42);
    } finally {
      await c.shutdown();
    }
  });

  it("routes invalid function sources to the error port", async () => {
    const c = getMakeFunction();
    const inSocket = noflo.internalSocket.createSocket();
    const functionSocket = noflo.internalSocket.createSocket();
    const errorSocket = noflo.internalSocket.createSocket();
    c.inPorts.in.attach(inSocket);
    c.inPorts.function.attach(functionSocket);
    c.outPorts.error.attach(errorSocket);
    try {
      functionSocket.post(new noflo.IP("data", "return ]invalid"));
      const errorIp = waitUntil(
        errorSocket,
        (ip) => ip.type === "data" || ip.type === "error",
      );
      inSocket.post(new noflo.IP("data", 1));
      const ip = await errorIp;
      assert.ok(ip.data instanceof Error);
    } finally {
      await c.shutdown();
    }
  });
});

describe("ReadEnv component", () => {
  it("reads an environment variable", async () => {
    process.env.NOFLO_CORE_TEST_VAR = "present";
    const c = getReadEnv();
    const keySocket = noflo.internalSocket.createSocket();
    const outSocket = noflo.internalSocket.createSocket();
    c.inPorts.key.attach(keySocket);
    c.outPorts.out.attach(outSocket);
    try {
      const outIp = waitUntil(outSocket, (ip) => ip.type === "data");
      keySocket.post(new noflo.IP("data", "NOFLO_CORE_TEST_VAR"));
      const ip = await outIp;
      assert.equal(ip.data, "present");
    } finally {
      delete process.env.NOFLO_CORE_TEST_VAR;
      await c.shutdown();
    }
  });

  it("routes missing variables to the error port", async () => {
    delete process.env.NOFLO_CORE_TEST_MISSING;
    const c = getReadEnv();
    const keySocket = noflo.internalSocket.createSocket();
    const errorSocket = noflo.internalSocket.createSocket();
    c.inPorts.key.attach(keySocket);
    c.outPorts.error.attach(errorSocket);
    try {
      const errorIp = waitUntil(
        errorSocket,
        (ip) => ip.type === "data" || ip.type === "error",
      );
      keySocket.post(new noflo.IP("data", "NOFLO_CORE_TEST_MISSING"));
      const ip = await errorIp;
      assert.match(ip.data.message, /No environment variable/);
    } finally {
      await c.shutdown();
    }
  });
});

describe("ReadGlobal component", () => {
  it("reads a global variable via globalThis", async () => {
    /** @type {any} */ (globalThis).NOFLO_CORE_TEST_GLOBAL = "here";
    const c = getReadGlobal();
    const nameSocket = noflo.internalSocket.createSocket();
    const valueSocket = noflo.internalSocket.createSocket();
    c.inPorts.name.attach(nameSocket);
    c.outPorts.value.attach(valueSocket);
    try {
      const valueIp = waitUntil(valueSocket, (ip) => ip.type === "data");
      nameSocket.post(new noflo.IP("data", "NOFLO_CORE_TEST_GLOBAL"));
      const ip = await valueIp;
      assert.equal(ip.data, "here");
    } finally {
      delete (/** @type {any} */ (globalThis).NOFLO_CORE_TEST_GLOBAL);
      await c.shutdown();
    }
  });
});

describe("Split component", () => {
  it("forwards the incoming grouping around the data", async () => {
    const c = getSplit();
    const inSocket = noflo.internalSocket.createSocket();
    const outSocket = noflo.internalSocket.createSocket();
    c.inPorts.in.attach(inSocket);
    c.outPorts.out.attach(outSocket);
    const outIps = collect(outSocket);
    try {
      const done = waitUntil(outSocket, (ip) => ip.type === "closeBracket");
      inSocket.post(new noflo.IP("openBracket", "bar"));
      inSocket.post(new noflo.IP("data", "foo"));
      inSocket.post(new noflo.IP("closeBracket", "bar"));
      await done;
      assert.deepEqual(
        outIps.map((ip) => [ip.type, ip.data]),
        [
          ["openBracket", "bar"],
          ["data", "foo"],
          ["closeBracket", "bar"],
        ],
      );
    } finally {
      await c.shutdown();
    }
  });

  it("drops bracket-only streams (2.x semantics)", async () => {
    const c = getSplit();
    const inSocket = noflo.internalSocket.createSocket();
    const outSocket = noflo.internalSocket.createSocket();
    c.inPorts.in.attach(inSocket);
    c.outPorts.out.attach(outSocket);
    const outIps = collect(outSocket);
    try {
      // The old mocha spec asserted "forward no packet" for group-only
      // input. In 2.x brackets do not fire the process function and
      // forwarded brackets attach to actual sends, so a bracket-only
      // stream produces nothing on out at all
      inSocket.post(new noflo.IP("openBracket", "foo"));
      inSocket.post(new noflo.IP("closeBracket", "foo"));
      await new Promise((resolve) => setTimeout(resolve, 100));
      assert.deepEqual(outIps, []);
    } finally {
      await c.shutdown();
    }
  });
});
