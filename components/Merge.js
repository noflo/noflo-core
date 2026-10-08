import { Component } from "@noflo/noflo";

/**
 * Forwards each received data packet to the connected output port.
 * @returns {import("@noflo/noflo").Component} The configured component
 */
export function getComponent() {
  const c = new Component({
    description:
      "This component receives data on multiple input ports and sends the same data out to the connected output port",
    icon: "compress",
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
