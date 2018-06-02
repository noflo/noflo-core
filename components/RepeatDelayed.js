/* eslint-disable
    consistent-return,
    func-names,
    import/no-unresolved,
    no-restricted-syntax,
    no-var,
    vars-on-top,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const noflo = require('noflo');

exports.getComponent = function () {
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

  c.outPorts.add(
    'out',
    { datatype: 'all' },
  );

  c.tearDown = function (callback) {
    for (const timer of Array.from(c.timers)) { clearTimeout(timer); }
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

    var timer = setTimeout(
      () => {
        c.timers.splice(c.timers.indexOf(timer), 1);
        return output.sendDone({ out: payload });
      }
      , delay,
    );
    return c.timers.push(timer);
  });
};
