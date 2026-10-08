import { Component } from "@noflo/noflo";

/**
 * Returns the value of a global variable, read from `globalThis` so the
 * component works on all platforms (replacing the 1.x `isBrowser` branch).
 * @returns {import("@noflo/noflo").Component} The configured component
 */
export function getComponent() {
  const c = new Component({
    description: "Returns the value of a global variable",
    icon: "usd",
    inPorts: {
      name: {
        datatype: "string",
        description: "The name of the global variable",
        required: true,
      },
    },
    outPorts: {
      value: {
        description: "The value of the variable",
      },
      error: {
        description: "Any errors that occurred reading the variable's value",
        datatype: "object",
      },
    },
  });

  c.forwardBrackets = { name: ["value", "error"] };

  c.process((input, output) => {
    if (!input.hasData("name")) {
      return;
    }
    const name = input.getData("name");
    const value = /** @type {Record<string, unknown>} */ (globalThis)[name];
    if (typeof value === "undefined") {
      output.sendDone(new Error(`"${name}" is undefined on the global object`));
      return;
    }
    output.sendDone({ value });
  });

  return c;
}
