const noflo = require('noflo');

exports.getComponent = () => {
  const c = new noflo.Component();
  c.description = 'Forward packet after a set delay';
  c.icon = 'clock-o';

  c.timers = [];

  c.inPorts.add('in', {
    datatype: 'all',
    description: 'Packet to be forwarded with a delay',
  });
  c.inPorts.add('delay', {
    datatype: 'number',
    description: 'How much to delay',
    default: 500,
    control: true,
  });

  c.outPorts.add('out', {
    datatype: 'all',
  });

  c.tearDown = (callback) => {
    c.timers.forEach(timer => clearTimeout(timer));
    c.timers = [];
    return callback();
  };

  return c.process((input, output) => {
    if (!input.hasData('in')) { return; }
    if (input.attached('delay').length && !input.hasData('delay')) { return; }

    let delay = 500;
    if (input.hasData('delay')) {
      delay = input.getData('delay');
    }
    const payload = input.get('in');

    const timer = setTimeout(() => {
      c.timers.splice(c.timers.indexOf(timer), 1);
      return output.sendDone({ out: payload });
    }, delay);
    c.timers.push(timer);
  });
};
