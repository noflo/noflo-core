/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const noflo = require('noflo');

exports.getComponent = function() {
  const c = new noflo.Component;
  c.description = `This component calls a given callback function for each \
IP it receives.  The Callback component is typically used to connect \
NoFlo with external Node.js code.`;
  c.icon = 'sign-out';

  c.inPorts.add('in', {
    description: 'Object passed as argument of the callback',
    datatype: 'all'
  }
  );
  c.inPorts.add('callback', {
    description: 'Callback to invoke',
    datatype: 'function',
    control: true,
    required: true
  }
  );
  c.outPorts.add('error',
    {datatype: 'object'});

  return c.process(function(input, output) {
    if (!input.hasData('callback', 'in')) { return; }
    const [callback, data] = Array.from(input.getData('callback', 'in'));
    if (typeof callback !== 'function') {
      output.done(new Error('The provided callback must be a function'));
      return;
    }

    // Call the callback when receiving data
    try {
      callback(data);
    } catch (e) {
      return output.done(e);
    }
    return output.done();
  });
};
