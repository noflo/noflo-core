const noflo = require('noflo');

exports.getComponent = () => {
  const c = new noflo.Component();
  c.description = 'Makes each data packet a stream of its own';
  c.icon = 'pause';
  c.forwardBrackets = {};
  c.autoOrdering = false;

  c.inPorts.add('in', {
    datatype: 'all',
    description: 'Packet to be forward with disconnection',
  });
  c.outPorts.add('out', {
    datatype: 'all',
  });

  let brackets = {};
  c.tearDown = (callback) => {
    brackets = {};
    callback();
  };
  return c.process((input, output) => {
    // Force auto-ordering to be off for this one
    c.autoOrdering = false;

    const data = input.get('in');
    if (!brackets[input.scope]) { brackets[input.scope] = []; }
    if (data.type === 'openBracket') {
      brackets[input.scope].push(data.data);
      output.done();
      return;
    }
    if (data.type === 'closeBracket') {
      brackets[input.scope].pop();
      output.done();
      return;
    }

    if (data.type !== 'data') { return; }

    brackets[input.scope].forEach((bracket) => {
      output.sendIP('out', new noflo.IP('openBracket', bracket));
    });
    output.sendIP('out', data);
    const closes = brackets[input.scope].slice(0);
    closes.reverse();
    brackets[input.scope].forEach((bracket) => {
      output.sendIP('out', new noflo.IP('closeBracket', bracket));
    });

    output.done();
  });
};
