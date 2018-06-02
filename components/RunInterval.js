/* eslint-disable
    consistent-return,
    func-names,
    guard-for-in,
    import/no-unresolved,
    no-param-reassign,
    no-restricted-syntax,
    no-return-assign,
    no-unused-vars,
    radix,
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
  c.description = 'Send a packet at the given interval';
  c.icon = 'clock-o';
  c.inPorts.add('interval', {
    datatype: 'number',
    description: 'Interval at which output packets are emitted (ms)',
    required: true,
    control: true,
  });
  c.inPorts.add('start', {
    datatype: 'bang',
    description: 'Start the emission',
  });
  c.inPorts.add('stop', {
    datatype: 'bang',
    description: 'Stop the emission',
  });
  c.outPorts.add(
    'out',
    { datatype: 'bang' },
  );

  c.timers = {};

  const cleanUp = function (scope) {
    if (!c.timers[scope]) { return; }
    clearInterval(c.timers[scope].interval);
    c.timers[scope].deactivate();
    return c.timers[scope] = null;
  };

  c.tearDown = function (callback) {
    for (const scope in c.timers) {
      const context = c.timers[scope];
      cleanUp(scope);
    }
    c.timers = {};
    return callback();
  };

  c.forwardBrackets = {};
  return c.process((input, output, context) => {
    if (input.hasData('start')) {
      if (!input.hasData('interval')) { return; }
      const start = input.get('start');
      if (start.type !== 'data') { return; }
      const interval = parseInt(input.getData('interval'));
      // Ensure we deactivate previous interval in this scope, if any
      cleanUp(start.scope);

      // Set up interval
      context.interval = setInterval(
        () => {
          const bang = new noflo.IP('data', true);
          bang.scope = start.scope;
          return c.outPorts.out.sendIP(bang);
        }
        , interval,
      );

      // Register scope, we keep it active until stopped
      c.timers[start.scope] = context;
      return;
    }

    if (input.hasData('stop')) {
      const stop = input.get('stop');
      if (stop.type !== 'data') { return; }
      // Deactivate interval in this scope
      cleanUp(stop.scope);
    }
  });
};
