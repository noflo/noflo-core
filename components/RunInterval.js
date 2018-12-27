const noflo = require('noflo');

exports.getComponent = () => {
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
  c.outPorts.add('out', {
    datatype: 'bang',
  });

  c.timers = {};

  const cleanUp = (scope) => {
    if (!c.timers[scope]) { return; }
    clearInterval(c.timers[scope].interval);
    c.timers[scope].deactivate();
    c.timers[scope] = null;
  };

  c.tearDown = (callback) => {
    Object.keys(c.timers).forEach(cleanUp);
    c.timers = {};
    callback();
  };

  c.forwardBrackets = {};
  return c.process((input, output, context) => {
    if (input.hasData('start')) {
      if (!input.hasData('interval')) { return; }
      const start = input.get('start');
      if (start.type !== 'data') { return; }
      const interval = parseInt(input.getData('interval'), 10);
      // Ensure we deactivate previous interval in this scope, if any
      cleanUp(start.scope);

      // Set up interval
      const ctx = context;
      ctx.interval = setInterval(() => {
        const bang = new noflo.IP('data', true);
        bang.scope = start.scope;
        return c.outPorts.out.sendIP(bang);
      }, interval);

      // Register scope, we keep it active until stopped
      c.timers[start.scope] = context;
      return;
    }

    if (input.hasData('stop')) {
      const stop = input.get('stop');
      if (stop.type !== 'data') { return; }
      // Deactivate interval in this scope
      cleanUp(stop.scope);
      output.done();
    }
  });
};
