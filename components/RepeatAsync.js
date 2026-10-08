import { Component } from "@noflo/noflo";

/**
 * Like Repeat, except the packet repeats on the next tick.
 * @returns {import("@noflo/noflo").Component} The configured component
 */
export function getComponent() {
  const c = new Component({
    description: "Like 'Repeat', except repeat on next tick",
    icon: "step-forward",
    inPorts: {
      in: {
        datatype: "all",
        description: "Packet to forward",
        required: true,
      },
    },
    outPorts: {
      out: {
        datatype: "all",
      },
    },
  });

  c.process((input, output) => {
    if (!input.hasData("in")) {
      return;
    }
    const data = input.getData("in");
    // The activation stays open until the delayed send completes
    setTimeout(() => output.sendDone({ out: data }), 0);
  });

  return c;
}
