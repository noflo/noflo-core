import { Component } from "@noflo/noflo";

/**
 * Sends the data items to console.log, then forwards them.
 *
 * The log happens asynchronously and fire-and-forget, preserving the
 * 1.x ordering semantics. `node:util` is loaded lazily so browser
 * bundlers do not need to resolve it; when inspection is unavailable
 * the data is logged as-is.
 * @returns {import("@noflo/noflo").Component} The configured component
 */
export function getComponent() {
  const c = new Component({
    description: "Sends the data items to console.log",
    icon: "bug",
    inPorts: {
      in: {
        datatype: "all",
        description: "Packet to be printed through console.log",
        required: true,
      },
      options: {
        datatype: "object",
        description: "Options to be passed to console.log inspection",
        control: true,
      },
    },
    outPorts: {
      out: {
        datatype: "all",
      },
    },
  });

  /**
   * @param {{ showHidden?: boolean, depth?: number, colors?: boolean } | null} options
   * @param {unknown} data
   */
  const log = (options, data) => {
    if (options != null) {
      return import("node:util")
        .then(({ inspect }) =>
          console.log(
            inspect(data, options.showHidden, options.depth, options.colors),
          ),
        )
        .catch(() => {
          console.log(data);
        });
    }
    console.log(data);
  };

  c.process((input, output) => {
    if (!input.hasData("in")) {
      return;
    }
    // Wait for an attached options connection to deliver before firing
    if (input.attached("options").length && !input.hasData("options")) {
      return;
    }
    let options = null;
    if (input.hasData("options")) {
      options = input.getData("options");
    }
    const data = input.getData("in");
    log(options, data);
    output.sendDone({ out: data });
  });

  return c;
}
