import { Component } from "@noflo/noflo";

/**
 * Calls a given callback function for each IP it receives. Typically
 * used to connect NoFlo with external Node.js code.
 * @returns {import("@noflo/noflo").Component} The configured component
 */
export function getComponent() {
  const c = new Component({
    description:
      "This component calls a given callback function for each IP it receives. The Callback component is typically used to connect NoFlo with external Node.js code",
    icon: "sign-out",
    inPorts: {
      in: {
        description: "Object passed as argument of the callback",
        datatype: "all",
        required: true,
      },
      callback: {
        description: "Callback to invoke",
        datatype: "function",
        control: true,
        required: true,
      },
    },
    outPorts: {
      error: { datatype: "object" },
    },
  });

  c.process((input, output) => {
    if (!input.hasData("callback", "in")) {
      return;
    }
    const [callback, data] = input.getData("callback", "in");
    if (typeof callback !== "function") {
      output.done(new Error("The provided callback must be a function"));
      return;
    }
    try {
      callback(data);
    } catch (err) {
      output.done(err instanceof Error ? err : new Error(String(err)));
      return;
    }
    output.done();
  });

  return c;
}
