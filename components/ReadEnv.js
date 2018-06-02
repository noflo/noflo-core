const noflo = require('noflo');

// @runtime noflo-nodejs

exports.getComponent = () => {
  const c = new noflo.Component();
  c.description = 'Reads an environment variable';
  c.icon = 'usd';

  c.inPorts.add('key', {
    datatype: 'string',
    required: true,
    description: 'Environment variable to read',
  });
  c.outPorts.add('out', {
    datatype: 'string',
  });
  c.outPorts.add('error', {
    datatype: 'object',
    required: false,
  });

  c.forwardBrackets = { key: ['out', 'error'] };

  return c.process((input, output) => {
    if (!input.hasData('key')) { return; }
    const data = input.getData('key');
    const value = process.env[data];
    if (value === undefined) {
      output.sendDone(new Error(`No environment variable ${data} set`));
      return;
    }
    output.sendDone({ out: value });
  });
};
