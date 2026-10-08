import { Component } from "@noflo/noflo";

/**
 * Reads an environment variable.
 * @returns {import("@noflo/noflo").Component} The configured component
 */
export function getComponent() {
  const c = new Component({
    description: "Reads an environment variable",
    icon: "usd",
    inPorts: {
      key: {
        datatype: "string",
        description: "Environment variable to read",
        required: true,
      },
    },
    outPorts: {
      out: {
        datatype: "string",
        description: "Value of the environment variable",
      },
      error: {
        datatype: "object",
        description: "The variable is not set",
      },
    },
  });

  c.forwardBrackets = { key: ["out", "error"] };

  c.process((input, output) => {
    if (!input.hasData("key")) {
      return;
    }
    const key = input.getData("key");
    const value = process.env[key];
    if (value === undefined) {
      output.sendDone(new Error(`No environment variable ${key} set`));
      return;
    }
    output.sendDone({ out: value });
  });

  return c;
}
