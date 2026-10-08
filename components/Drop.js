import { Component } from "@noflo/noflo";

/**
 * Drops every packet it receives with no action.
 * @returns {import("@noflo/noflo").Component} The configured component
 */
export function getComponent() {
  const c = new Component({
    description: "This component drops every packet it receives with no action",
    icon: "trash-o",
    inPorts: {
      in: {
        datatype: "all",
        description: "Packet to be dropped",
        required: true,
      },
    },
  });

  c.process((input, output) => {
    if (!input.hasData("in")) {
      return;
    }
    // Consuming the packet without sending drops it; the 1.x IP.drop()
    // call has no 2.x equivalent and is not needed for that semantics
    input.getData("in");
    output.done();
  });

  return c;
}
