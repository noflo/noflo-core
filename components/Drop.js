/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const noflo = require('noflo');

exports.getComponent = function() {
  const c = new noflo.Component;
  c.description = `This component drops every packet it receives with no \
action`;
  c.icon = 'trash-o';

  c.inPorts.add('in', {
    datatypes: 'all',
    description: 'Packet to be dropped'
  }
  );

  return c.process(function(input, output) {
    const data = input.get('in');
    data.drop();
    output.done();
  });
};
