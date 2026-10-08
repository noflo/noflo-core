import { Component } from "@noflo/noflo";

/**
 * Evaluates a function each time data hits the "in" port and sends the
 * return value to "out". Within the function "x" is the incoming value.
 * For example, to make a ^2 function input "return x*x;" to the function
 * port.
 *
 * The 1.x version had a branch sending the prepared function without
 * evaluating it; it was unreachable (the `function` port is a control
 * port and never fires the process function), so it is not carried over.
 * @returns {import("@noflo/noflo").Component} The configured component
 */
export function getComponent() {
  const c = new Component({
    description:
      'Evaluates a function each time data hits the "in" port and sends the return value to "out". Within the function "x" will be the variable from the in port. For example, to make a ^2 function input "return x*x;" to the function port',
    icon: "code",
    inPorts: {
      in: {
        datatype: "all",
        description: "Packet to be processed",
        required: true,
      },
      function: {
        datatype: "string",
        description: "Function to evaluate",
        control: true,
        required: true,
      },
    },
    outPorts: {
      out: {
        datatype: "all",
      },
      function: {
        datatype: "function",
        description: "The prepared function",
      },
      error: {
        datatype: "object",
        description: "Invalid function source or evaluation errors",
      },
    },
  });

  c.process((input, output) => {
    if (!input.hasData("in", "function")) {
      return;
    }
    /** @type {string | ((x: unknown) => unknown)} */
    const source = input.getData("function");
    let fn;
    try {
      fn = typeof source === "function" ? source : Function("x", source);
    } catch (err) {
      output.done(err instanceof Error ? err : new Error(String(err)));
      return;
    }
    const data = input.getData("in");
    let result;
    try {
      result = fn(data);
    } catch (err) {
      output.done(err instanceof Error ? err : new Error(String(err)));
      return;
    }
    output.sendDone({ out: result, function: fn });
  });

  return c;
}
