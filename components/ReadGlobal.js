/* global window: true */
const noflo = require('noflo');

exports.getComponent = () => {
  const c = new noflo.Component();
  c.description = 'Returns the value of a global variable.';
  c.icon = 'usd';

  c.inPorts.add('name', {
    description: 'The name of the global variable.',
    datatype: 'string',
  });

  c.outPorts.add('value', {
    description: 'The value of the variable.',
  });
  c.outPorts.add('error', {
    description: 'Any errors that occured reading the variables value.',
    datatype: 'object',
  });

  c.forwardBrackets = { name: ['value', 'error'] };

  return c.process((input, output) => {
    if (!input.hasData('name')) { return; }
    const data = input.getData('name');

    const value = !noflo.isBrowser() ? global[data] : window[data];

    if (typeof value === 'undefined') {
      const err = new Error(`"${data}" is undefined on the global object.`);
      output.sendDone(err);
      return;
    }
    output.sendDone({ value });
  });
};
