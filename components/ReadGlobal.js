/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const noflo = require('noflo');

exports.getComponent = function() {
  const c = new noflo.Component;
  c.description = 'Returns the value of a global variable.';
  c.icon = 'usd';

  // inPorts
  c.inPorts.add('name',
    {description: 'The name of the global variable.'});

  // outPorts
  c.outPorts.add('value',
    {description: 'The value of the variable.'});

  c.outPorts.add('error',
    {description: 'Any errors that occured reading the variables value.'});

  c.forwardBrackets =
    {name: ['value', 'error']};

  return c.process(function(input, output) {
    if (!input.hasData('name')) { return; }
    const data = input.getData('name');

    const value = !noflo.isBrowser() ? global[data] : window[data];

    if (typeof value === 'undefined') {
      const err = new Error(`\"${data}\" is undefined on the global object.`);
      output.sendDone(err);
      return;
    }
    return output.sendDone({
      value});
  });
};
