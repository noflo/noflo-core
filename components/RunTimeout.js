import { Component } from "@noflo/noflo";

/**
 * Sends a bang packet after the given time in milliseconds, per scope.
 * A new `start` cancels a pending timeout in the same scope.
 * @returns {import("@noflo/noflo").Component} The configured component
 */
export function getComponent() {
  const c = new Component({
    description: "Send a packet after the given time in ms",
    icon: "clock-o",
    inPorts: {
      time: {
        datatype: "number",
        description: "Time after which a packet will be sent",
        required: true,
        control: true,
      },
      start: {
        datatype: "bang",
        description: "Start the timeout before sending a packet",
        required: true,
      },
    },
    outPorts: {
      out: {
        datatype: "bang",
      },
    },
  });

  c.forwardBrackets = { start: ["out"] };

  /**
   * @typedef {Object} TimeoutEntry
   * @property {NodeJS.Timeout} timeout
   * @property {{ deactivated?: boolean, deactivate(): void }} context
   */
  /** @type {Map<string | typeof undefined, TimeoutEntry>} */
  const timers = new Map();

  /**
   * @param {string | typeof undefined} scope
   */
  const stopTimer = (scope) => {
    const entry = timers.get(scope);
    if (!entry) {
      return;
    }
    clearTimeout(entry.timeout);
    timers.delete(scope);
    if (entry.context && !entry.context.deactivated) {
      entry.context.deactivate();
    }
  };

  c.tearDown = async () => {
    for (const scope of [...timers.keys()]) {
      stopTimer(scope);
    }
  };

  c.process((input, output, context) => {
    if (!input.hasData("time", "start")) {
      return;
    }
    const time = parseInt(input.getData("time"), 10);
    input.getData("start");
    // Deactivate a previous timeout in this scope, if any
    stopTimer(input.scope);
    // Set up the new timeout; the activation stays open until it fires
    // and completes it via sendDone
    const timer = setTimeout(() => {
      timers.delete(input.scope);
      output.sendDone({ out: true });
    }, time);
    timers.set(input.scope, { timeout: timer, context });
  });

  return c;
}
