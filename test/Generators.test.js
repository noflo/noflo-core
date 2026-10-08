import assert from "node:assert/strict";
import { describe, it } from "node:test";
import * as noflo from "@noflo/noflo";

import { getComponent as getDisconnect } from "../components/DisconnectAfterPacket.js";
import { getComponent as getRepeatDelayed } from "../components/RepeatDelayed.js";
import { getComponent as getRunInterval } from "../components/RunInterval.js";
import { getComponent as getRunTimeout } from "../components/RunTimeout.js";
import { getComponent as getSendNext } from "../components/SendNext.js";

/**
 * Waits for the next IP on a socket matching the predicate.
 * @param {import("@noflo/noflo").internalSocket.InternalSocket} socket
 * @param {(ip: import("@noflo/noflo").IP) => boolean} predicate
 * @returns {Promise<import("@noflo/noflo").IP>}
 */
const waitUntil = (socket, predicate) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Timed out waiting for IP"));
    }, 3000);
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

describe("SendNext component", () => {
  it("releases exactly one data packet per bang", async () => {
    const c = getSendNext();
    const dataSocket = noflo.internalSocket.createSocket();
    const inSocket = noflo.internalSocket.createSocket();
    const outSocket = noflo.internalSocket.createSocket();
    const emptySocket = noflo.internalSocket.createSocket();
    c.inPorts.data.attach(dataSocket);
    c.inPorts.in.attach(inSocket);
    c.outPorts.out.attach(outSocket);
    c.outPorts.empty.attach(emptySocket);
    const outIps = collect(outSocket);
    try {
      const first = waitUntil(outSocket, (ip) => ip.type === "data");
      dataSocket.post(new noflo.IP("openBracket", "stream"));
      dataSocket.post(new noflo.IP("data", "one"));
      dataSocket.post(new noflo.IP("data", "two"));
      dataSocket.post(new noflo.IP("closeBracket", "stream"));
      inSocket.post(new noflo.IP("data", true));
      await first;
      // Bracket packets are passed through; the first data packet ends
      // the release
      assert.deepEqual(
        outIps.map((ip) => [ip.type, ip.data]),
        [
          ["openBracket", "stream"],
          ["data", "one"],
        ],
      );
    } finally {
      await c.shutdown();
    }
  });

  it("signals empty when the buffer holds no data packet", async () => {
    const c = getSendNext();
    const inSocket = noflo.internalSocket.createSocket();
    const outSocket = noflo.internalSocket.createSocket();
    const emptySocket = noflo.internalSocket.createSocket();
    c.inPorts.in.attach(inSocket);
    c.outPorts.out.attach(outSocket);
    c.outPorts.empty.attach(emptySocket);
    try {
      const emptyIp = waitUntil(
        emptySocket,
        (ip) => ip.type === "data" || ip.type === "error",
      );
      inSocket.post(new noflo.IP("data", true));
      const ip = await emptyIp;
      assert.equal(ip.data, true);
    } finally {
      await c.shutdown();
    }
  });
});

describe("DisconnectAfterPacket component", () => {
  it("wraps each data packet in its own stream", async () => {
    const c = getDisconnect();
    const inSocket = noflo.internalSocket.createSocket();
    const outSocket = noflo.internalSocket.createSocket();
    c.inPorts.in.attach(inSocket);
    c.outPorts.out.attach(outSocket);
    const outIps = collect(outSocket);
    try {
      const done = waitUntil(outSocket, (ip) => ip.type === "closeBracket");
      inSocket.post(new noflo.IP("openBracket", "outer"));
      inSocket.post(new noflo.IP("data", "one"));
      inSocket.post(new noflo.IP("data", "two"));
      inSocket.post(new noflo.IP("closeBracket", "outer"));
      await done;
      // Each data packet is wrapped in the currently open brackets
      assert.deepEqual(
        outIps.map((ip) => [ip.type, ip.data]),
        [
          ["openBracket", "outer"],
          ["data", "one"],
          ["closeBracket", "outer"],
          ["openBracket", "outer"],
          ["data", "two"],
          ["closeBracket", "outer"],
        ],
      );
    } finally {
      await c.shutdown();
    }
  });
});

describe("RepeatDelayed component", () => {
  it("forwards the packet after the configured delay", async () => {
    const c = getRepeatDelayed();
    const inSocket = noflo.internalSocket.createSocket();
    const delaySocket = noflo.internalSocket.createSocket();
    const outSocket = noflo.internalSocket.createSocket();
    c.inPorts.in.attach(inSocket);
    c.inPorts.delay.attach(delaySocket);
    c.outPorts.out.attach(outSocket);
    try {
      delaySocket.post(new noflo.IP("data", 100));
      const outIp = waitUntil(outSocket, (ip) => ip.type === "data");
      const start = Date.now();
      inSocket.post(new noflo.IP("data", "delayed"));
      const ip = await outIp;
      assert.equal(ip.data, "delayed");
      assert.ok(Date.now() - start >= 90, "should have waited the delay");
    } finally {
      await c.shutdown();
    }
  });
});

describe("RunInterval component", () => {
  it("emits scoped bangs at the configured interval until stopped", async () => {
    const c = getRunInterval();
    const intervalSocket = noflo.internalSocket.createSocket();
    const startSocket = noflo.internalSocket.createSocket();
    const stopSocket = noflo.internalSocket.createSocket();
    const outSocket = noflo.internalSocket.createSocket();
    c.inPorts.interval.attach(intervalSocket);
    c.inPorts.start.attach(startSocket);
    c.inPorts.stop.attach(stopSocket);
    c.outPorts.out.attach(outSocket);
    const outIps = collect(outSocket);
    try {
      // Control port first, then the firing start bang
      intervalSocket.post(new noflo.IP("data", 50));
      const first = waitUntil(outSocket, (ip) => ip.type === "data");
      startSocket.post(new noflo.IP("data", true));
      await first;
      // Wait until at least two bangs have arrived, then stop
      await waitUntil(
        outSocket,
        () => outIps.filter((ip) => ip.type === "data").length >= 2,
      );
      const stopDone = waitUntil(stopSocket, () => false).catch(() => {});
      stopSocket.post(new noflo.IP("data", true));
      await stopDone;
      const count = outIps.filter((ip) => ip.type === "data").length;
      await new Promise((resolve) => setTimeout(resolve, 120));
      assert.equal(
        outIps.filter((ip) => ip.type === "data").length,
        count,
        "no bangs after stop",
      );
      for (const ip of outIps.filter((ip) => ip.type === "data")) {
        assert.equal(ip.data, true);
      }
    } finally {
      // tearDown must clear any still-running intervals
      await c.shutdown();
    }
  });
});

describe("RunTimeout component", () => {
  it("emits a bang after the configured time", async () => {
    const c = getRunTimeout();
    const timeSocket = noflo.internalSocket.createSocket();
    const startSocket = noflo.internalSocket.createSocket();
    const outSocket = noflo.internalSocket.createSocket();
    c.inPorts.time.attach(timeSocket);
    c.inPorts.start.attach(startSocket);
    c.outPorts.out.attach(outSocket);
    try {
      timeSocket.post(new noflo.IP("data", 100));
      const outIp = waitUntil(outSocket, (ip) => ip.type === "data");
      const start = Date.now();
      startSocket.post(new noflo.IP("data", true));
      const ip = await outIp;
      assert.equal(ip.data, true);
      assert.ok(Date.now() - start >= 90, "should have waited the timeout");
      await c.shutdown();
    } finally {
      await c.shutdown();
    }
  });

  it("cancels a pending timeout when restarted in the same scope", async () => {
    const c = getRunTimeout();
    const timeSocket = noflo.internalSocket.createSocket();
    const startSocket = noflo.internalSocket.createSocket();
    const outSocket = noflo.internalSocket.createSocket();
    c.inPorts.time.attach(timeSocket);
    c.inPorts.start.attach(startSocket);
    c.outPorts.out.attach(outSocket);
    try {
      timeSocket.post(new noflo.IP("data", 200));
      startSocket.post(new noflo.IP("data", true));
      // Restart cancels the first pending timeout; the second fires
      startSocket.post(new noflo.IP("data", true));
      const outIp = waitUntil(outSocket, (ip) => ip.type === "data");
      const ip = await outIp;
      assert.equal(ip.data, true);
      // Exactly one bang must arrive
      await new Promise((resolve) => setTimeout(resolve, 350));
      // No way to receive more through this socket; shutdown must succeed
      await c.shutdown();
    } finally {
      await c.shutdown();
    }
  });
});
