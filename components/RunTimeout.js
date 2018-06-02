/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const noflo = require('noflo');

exports.getComponent = function() {
  const c = new noflo.Component;
  c.description = 'Send a packet after the given time in ms';
  c.icon = 'clock-o';

  c.timer = {};

  c.inPorts.add('time', {
    datatype: 'number',
    description: 'Time after which a packet will be sent',
    required: true,
    control: true
  }
  );
  c.inPorts.add('start', {
    datatype: 'bang',
    description: 'Start the timeout before sending a packet'
  }
  );
  c.outPorts.add('out',
    {datatype: 'bang'});

  c.forwardBrackets =
    {start: ['out']};

  c.stopTimer = function(scope) {
    if (!c.timer[scope]) { return; }
    clearTimeout(c.timer[scope].timeout);
    c.timer[scope].deactivate();
    return delete c.timer[scope];
  };

  c.tearDown = function(callback) {
    for (let scope in c.timer) {
      const timer = c.timer[scope];
      c.stopTimer(scope);
    }
    return callback();
  };

  return c.process(function(input, output, context) {
    if (!input.hasData('time', 'start')) { return; }
    const time = input.getData('time');
    const bang = input.getData('start');
    // Ensure we deactivate previous timeout, if any
    c.stopTimer(input.scope);
    // Set up new timer
    context.timeout = setTimeout(function() {
      c.timer = null;
      return output.sendDone({
        out: true});
    }
    , time);
    c.timer[input.scope] = context;
  });
};
