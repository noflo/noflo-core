const noflo = require('noflo');

exports.getComponent = () => {
  const c = new noflo.Component();
  c.description = `This component calls a given callback function for each
IP it receives.  The Callback component is typically used to connect
NoFlo with external Node.js code.`;
  c.icon = 'sign-out';

  c.inPorts.add('in', {
    description: 'Object passed as argument of the callback',
    datatype: 'all',
  });
  c.inPorts.add('callback', {
    description: 'Callback to invoke',
    datatype: 'function',
    control: true,
    required: true,
  });
  c.outPorts.add(
    'error',
    { datatype: 'object' },
  );

  return c.process((input, output) => {
    if (!input.hasData('callback', 'in')) {
      return;
    }
    const [callback, data] = input.getData('callback', 'in');
    if (typeof callback !== 'function') {
      output.done(new Error('The provided callback must be a function'));
      return;
    }

    // Call the callback when receiving data
    try {
      callback(data);
    } catch (e) {
      output.done(e);
      return;
    }
    output.done();
  });
};
