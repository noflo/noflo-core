import { Component } from "@noflo/noflo";

/**
 * Forwards packets and metadata in the same way it receives them.
 * @returns {import("@noflo/noflo").Component} The configured component
 */
export function getComponent() {
  const c = new Component({
    description:
      "Forwards packets and metadata in the same way it receives them",
    icon: "forward",
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
    output.sendDone({ out: data });
  });

  return c;
}
