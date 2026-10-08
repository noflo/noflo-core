import { Component } from "@noflo/noflo";

/**
 * Sends the next packet in the buffer when receiving a bang. Bracket
 * packets in the buffer are passed through until the next data packet,
 * which is sent and ends the activation.
 * @returns {import("@noflo/noflo").Component} The configured component
 */
export function getComponent() {
  const c = new Component({
    description: "Sends next packet in buffer when receiving a bang",
    icon: "forward",
    inPorts: {
      data: {
        datatype: "all",
        description: "Buffered packets to release one at a time",
        required: true,
      },
      in: {
        datatype: "bang",
        description: "Bang releasing the next buffered packet",
        required: true,
      },
    },
    outPorts: {
      out: {
        datatype: "all",
      },
      empty: {
        datatype: "bang",
        description: "Sent when the buffer holds no data packet",
      },
    },
  });

  c.forwardBrackets = {};

  c.process((input, output) => {
    if (!input.hasData("in")) {
      return;
    }
    const bang = input.getData("in");
    if (!input.hasData("data")) {
      // No data packets in the buffer, send "empty"
      output.sendDone({ empty: true });
      return;
    }
    let sent = false;
    // Loop until we've either drained the buffer completely, or until
    // we hit the next data packet
    while (input.has("data")) {
      if (sent) {
        // If we already sent data, look ahead: bail out when the next
        // buffered packet is data
        const buf = c.inPorts.data.getBuffer(bang.scope);
        if (buf[0].type === "data") {
          break;
        }
      }
      const packet = /** @type {import("@noflo/noflo").IP} */ (
        input.get("data")
      );
      output.send({ out: packet });
      if (packet.type === "data") {
        sent = true;
      }
    }
    output.done();
  });

  return c;
}
