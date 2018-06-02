/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const noflo = require('noflo');

// @runtime noflo-nodejs

exports.getComponent = function() {
  const c = new noflo.Component;
  c.description = 'Reads an environment variable';
  c.icon = 'usd';

  c.inPorts.add('key', {
    datatype: 'string',
    required: true,
    description: 'Environment variable to read'
  }
  );
  c.outPorts.add('out',
    {datatype: 'string'});
  c.outPorts.add('error', {
    datatype: 'object',
    required: false
  }
  );

  c.forwardBrackets =
    {key: ['out', 'error']};

  return c.process(function(input, output) {
    if (!input.hasData('key')) { return; }
    const data = input.getData('key');
    const value = process.env[data];
    if (value === undefined) {
      output.sendDone(new Error(`No environment variable ${data} set`));
      return;
    }
    return output.sendDone({
      out: value});
  });
};
