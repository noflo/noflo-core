import { Component } from "@noflo/noflo";

/**
 * Generates a single packet and sends it to the output port. Mostly
 * usable for debugging, but can also be useful for starting networks.
 * @returns {import("@noflo/noflo").Component} The configured component
 */
export function getComponent() {
  const c = new Component({
    description:
      "This component generates a single packet and sends it to the output port. Mostly usable for debugging, but can also be useful for starting up networks",
    icon: "share",
    inPorts: {
      in: {
        datatype: "bang",
        description: "Signal to send the data packet",
        required: true,
      },
      data: {
        datatype: "all",
        description: "Packet to be sent",
        control: true,
        default: null,
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
    // Wait for an attached data connection to deliver before firing
    if (input.attached("data").length && !input.hasData("data")) {
      return;
    }
    input.getData("in");
    const data = input.hasData("data") ? input.getData("data") : null;
    output.send({ out: data });
    output.done();
  });

  return c;
}
