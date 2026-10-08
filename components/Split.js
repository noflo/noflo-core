import { Component } from "@noflo/noflo";

/**
 * Forwards each received data packet to all connected output ports.
 *
 * 1.x forwarded brackets manually via `input.get()`; in 2.x the default
 * `forwardBrackets` machinery forwards the incoming grouping around the
 * data sends, and the process function only fires on data packets.
 * @returns {import("@noflo/noflo").Component} The configured component
 */
export function getComponent() {
  const c = new Component({
    description:
      "This component receives data on a single input port and sends the same data out to all connected output ports",
    icon: "expand",
    inPorts: {
      in: {
        datatype: "all",
        description: "Packet to be forwarded",
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
    output.sendDone({ out: data });
  });

  return c;
}
