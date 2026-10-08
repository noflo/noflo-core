import { Component, IP } from "@noflo/noflo";

/**
 * Sends a bang packet at the given interval, per scope. Scopes are
 * stopped with the `stop` port or at network shutdown.
 * @returns {import("@noflo/noflo").Component} The configured component
 */
export function getComponent() {
  const c = new Component({
    description: "Send a packet at the given interval",
    icon: "clock-o",
    inPorts: {
      interval: {
        datatype: "number",
        description:
          "Interval at which output packets are emitted in milliseconds",
        required: true,
        control: true,
      },
      start: {
        datatype: "bang",
        description: "Start the emission",
        required: true,
      },
      stop: {
        datatype: "bang",
        description: "Stop the emission",
      },
    },
    outPorts: {
      out: {
        datatype: "bang",
      },
    },
  });

  c.forwardBrackets = {};

  /**
   * @typedef {Object} IntervalEntry
   * @property {NodeJS.Timeout} interval
   * @property {{ deactivated?: boolean, deactivate(): void }} context
   */
  /** @type {Map<string | typeof undefined, IntervalEntry>} */
  const timers = new Map();

  /**
   * @param {string | typeof undefined} scope
   */
  const cleanUp = (scope) => {
    const entry = timers.get(scope);
    if (!entry) {
      return;
    }
    clearInterval(entry.interval);
    timers.delete(scope);
    if (entry.context && !entry.context.deactivated) {
      entry.context.deactivate();
    }
  };

  c.tearDown = async () => {
    for (const scope of [...timers.keys()]) {
      cleanUp(scope);
    }
  };

  c.process((input, output, context) => {
    if (input.hasData("stop")) {
      input.getData("stop");
      cleanUp(input.scope);
      output.done();
      return;
    }
    if (!input.hasData("start")) {
      return;
    }
    if (!input.hasData("interval")) {
      return;
    }
    input.getData("start");
    const interval = parseInt(input.getData("interval"), 10);
    // Deactivate a previous interval in this scope, if any
    cleanUp(input.scope);
    const timer = setInterval(() => {
      c.outPorts.out.sendIP(new IP("data", true, { scope: input.scope }));
    }, interval);
    // Keep the activation open until stopped; cleanUp deactivates it
    timers.set(input.scope, { interval: timer, context });
  });

  return c;
}
