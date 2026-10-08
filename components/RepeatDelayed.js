import { Component } from "@noflo/noflo";

/**
 * Forwards a packet after a set delay.
 * @returns {import("@noflo/noflo").Component} The configured component
 */
export function getComponent() {
  const c = new Component({
    description: "Forward packet after a set delay",
    icon: "clock-o",
    inPorts: {
      in: {
        datatype: "all",
        description: "Packet to be forwarded with a delay",
        required: true,
      },
      delay: {
        datatype: "number",
        description: "How much to delay in milliseconds",
        default: 500,
        control: true,
      },
    },
    outPorts: {
      out: {
        datatype: "all",
      },
    },
  });

  /** @type {NodeJS.Timeout[]} */
  const timers = [];

  c.tearDown = async () => {
    for (const timer of timers) {
      clearTimeout(timer);
    }
    timers.length = 0;
  };

  c.process((input, output) => {
    if (!input.hasData("in")) {
      return;
    }
    // Wait for an attached delay connection to deliver before firing
    if (input.attached("delay").length && !input.hasData("delay")) {
      return;
    }
    const delay = input.hasData("delay") ? input.getData("delay") : 500;
    const payload = input.getData("in");
    // The activation stays open until the delayed send completes
    const timer = setTimeout(() => {
      const index = timers.indexOf(timer);
      if (index !== -1) {
        timers.splice(index, 1);
      }
      output.sendDone({ out: payload });
    }, delay);
    timers.push(timer);
  });

  return c;
}
