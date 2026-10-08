import { Component, IP } from "@noflo/noflo";

/**
 * Makes each data packet a stream of its own, wrapping it in the
 * brackets currently open on the input.
 *
 * 2.x conversion note: brackets do not fire the process function, so the
 * 1.x per-IP activation pattern is replaced by consuming the buffered
 * stream with `getStream` and walking it. Bracket state is keyed by
 * scope and stored in the component closure.
 * @returns {import("@noflo/noflo").Component} The configured component
 */
export function getComponent() {
  const c = new Component({
    description: "Makes each data packet a stream of its own",
    icon: "pause",
    inPorts: {
      in: {
        datatype: "all",
        description: "Packet to be forwarded with its own stream grouping",
        required: true,
      },
    },
    outPorts: {
      out: {
        datatype: "all",
      },
    },
  });

  c.forwardBrackets = {};
  c.autoOrdering = false;

  /** @type {Map<string | typeof undefined, string[]>} */
  const bracketStacks = new Map();

  c.tearDown = async () => {
    bracketStacks.clear();
  };

  c.process((input, output) => {
    if (!input.hasData("in")) {
      return;
    }
    const stream = /** @type {import("@noflo/noflo").IP[]} */ (
      input.getStream("in")
    );
    let stack = bracketStacks.get(input.scope);
    if (!stack) {
      stack = [];
      bracketStacks.set(input.scope, stack);
    }
    for (const packet of stream) {
      if (packet.type === "openBracket") {
        stack.push(packet.data);
        continue;
      }
      if (packet.type === "closeBracket") {
        stack.pop();
        continue;
      }
      if (packet.type !== "data") {
        continue;
      }
      for (const bracket of stack) {
        output.sendIP("out", new IP("openBracket", bracket));
      }
      output.sendIP("out", packet);
      const closes = stack.slice(0);
      closes.reverse();
      for (const bracket of closes) {
        output.sendIP("out", new IP("closeBracket", bracket));
      }
    }
    output.done();
  });

  return c;
}
