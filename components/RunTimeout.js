const noflo = require('noflo');

exports.getComponent = () => {
  const c = new noflo.Component();
  c.description = 'Send a packet after the given time in ms';
  c.icon = 'clock-o';

  c.timer = {};

  c.inPorts.add('time', {
    datatype: 'number',
    description: 'Time after which a packet will be sent',
    required: true,
    control: true,
  });
  c.inPorts.add('start', {
    datatype: 'bang',
    description: 'Start the timeout before sending a packet',
  });
  c.outPorts.add('out', {
    datatype: 'bang',
  });

  c.forwardBrackets = { start: ['out'] };

  c.stopTimer = (scope) => {
    if (!c.timer[scope]) { return; }
    clearTimeout(c.timer[scope].timeout);
    c.timer[scope].deactivate();
    delete c.timer[scope];
  };

  c.tearDown = (callback) => {
    Object.keys(c.timer).forEach(scope => c.stopTimer(scope));
    callback();
  };

  return c.process((input, output, context) => {
    if (!input.hasData('time', 'start')) { return; }
    const time = parseInt(input.getData('time'), 10);
    input.getData('start');
    // Ensure we deactivate previous timeout, if any
    c.stopTimer(input.scope);
    // Set up new timer
    const ctx = context;
    ctx.timeout = setTimeout(() => {
      c.timer = null;
      output.sendDone({ out: true });
    }, time);
    c.timer[input.scope] = context;
  });
};
