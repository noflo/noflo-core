import { Component } from "@noflo/noflo";

/**
 * Deep-copies incoming packets using the Web-standard `structuredClone`.
 *
 * Values that cannot be structurally cloned (e.g. functions) are sent
 * through by reference, matching the old `owl-deepcopy` behavior.
 * @returns {import("@noflo/noflo").Component} The configured component
 */
export function getComponent() {
  const c = new Component({
    description: "Deep (i.e. recursively) copy an object",
    icon: "copy",
    inPorts: {
      in: {
        datatype: "all",
        description: "Packet to be copied",
        required: true,
      },
    },
    outPorts: {
      out: {
        datatype: "all",
        description: "Copy of the original packet",
      },
    },
  });

  c.process((input, output) => {
    if (!input.hasData("in")) {
      return;
    }
    const data = input.getData("in");
    let copy;
    try {
      copy = structuredClone(data);
    } catch (err) {
      if (err instanceof Error && err.name === "DataCloneError") {
        copy = data;
      } else {
        throw err;
      }
    }
    output.sendDone({ out: copy });
  });

  return c;
}
