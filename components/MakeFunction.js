/* eslint-disable
    block-scoped-var,
    consistent-return,
    func-names,
    import/no-unresolved,
    no-multi-str,
    no-new-func,
    no-undef,
    no-use-before-define,
    no-var,
    vars-on-top,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const noflo = require('noflo');

exports.getComponent = function () {
  const c = new noflo.Component();
  c.description = 'Evaluates a function each time data hits the "in" port \
and sends the return value to "out". Within the function "x" will \
be the variable from the in port. For example, to make a ^2 function \
input "return x*x;" to the function port.';
  c.icon = 'code';

  c.inPorts.add('in', {
    datatype: 'all',
    description: 'Packet to be processed',
  });
  c.inPorts.add('function', {
    datatype: 'string',
    description: 'Function to evaluate',
    control: true,
  });
  c.outPorts.add(
    'out',
    { datatype: 'all' },
  );
  c.outPorts.add(
    'function',
    { datatype: 'function' },
  );
  c.outPorts.add(
    'error',
    { datatype: 'object' },
  );

  const prepareFunction = function (func, callback) {
    let newFunc;
    if (typeof func === 'function') {
      callback(null, func);
      return;
    }
    try {
      newFunc = Function('x', func);
    } catch (e) {
      callback(e);
      return;
    }
    return callback(null, newFunc);
  };

  return c.process((input, output) => {
    if (input.attached('in').length && !input.hasData('in')) { return; }
    if (input.hasData('function', 'in')) {
      // Both function and input data
      prepareFunction(input.getData('function'), (err, func) => {
        let result;
        if (err) {
          output.done(e);
          return;
        }
        const data = input.getData('in');
        try {
          result = func(data);
        } catch (error) {
          var e = error;
          output.done(e);
          return;
        }
        output.sendDone({
          function: func,
          out: result,
        });
      });
      return;
    }
    if (!input.hasData('function')) { return; }
    prepareFunction(input.getData('function'), (err, func) => {
      if (err) {
        output.done(e);
        return;
      }
      output.sendDone({ function: func });
    });
  });
};
