/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const noflo = require('noflo');

exports.getComponent = function() {
  const c = new noflo.Component;
  c.description = 'Makes each data packet a stream of its own';
  c.icon = 'pause';
  c.forwardBrackets = {};
  c.autoOrdering = false;

  c.inPorts.add('in', {
    datatype: 'all',
    description: 'Packet to be forward with disconnection'
  }
  );
  c.outPorts.add('out',
    {datatype: 'all'});

  let brackets = {};
  c.tearDown = callback => brackets = {};
  return c.process(function(input, output) {
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

    for (var bracket of Array.from(brackets[input.scope])) {
      output.sendIP('out', new noflo.IP('openBracket', bracket));
    }
    output.sendIP('out', data);
    const closes = brackets[input.scope].slice(0);
    closes.reverse();
    for (bracket of Array.from(closes)) {
      output.sendIP('out', new noflo.IP('closeBracket', bracket));
    }

    return output.done();
  });
};
