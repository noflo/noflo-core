/* eslint-disable
    func-names,
    import/no-unresolved,
    no-multi-str,
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
  c.description = 'Forwards packets and metadata in the same way \
it receives them';
  c.icon = 'forward';
  c.inPorts.add('in', {
    datatype: 'all',
    description: 'Packet to forward',
  });
  c.outPorts.add(
    'out',
    { datatype: 'all' },
  );

  return c.process((input, output) => {
    const data = input.get('in');
    return output.sendDone({ out: data });
  });
};
