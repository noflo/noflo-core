/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let util;
const noflo = require('noflo');

if (!noflo.isBrowser()) {
  util = require('util');
} else {
  util =
    {inspect(data) { return data; }};
}

const log = function(options, data) {
  if (options != null) {
    return console.log(util.inspect(data,
      options.showHidden, options.depth, options.colors)
    );
  } else {
    return console.log(data);
  }
};

exports.getComponent = function() {
  const c = new noflo.Component;
  c.description = 'Sends the data items to console.log';
  c.icon = 'bug';

  c.inPorts.add('in', {
    datatype: 'all',
    description: 'Packet to be printed through console.log'
  }
  );
  c.inPorts.add('options', {
    datatype: 'object',
    description: 'Options to be passed to console.log',
    control: true
  }
  );
  c.outPorts.add('out',
    {datatype: 'all'});

  return c.process(function(input, output) {
    if (!input.hasData('in')) { return; }
    if (input.attached('options').length && !input.hasData('options')) { return; }

    let options = null;
    if (input.has('options')) {
      options = input.getData('options');
    }

    const data = input.getData('in');
    log(options, data);
    return output.sendDone({
      out: data});
  });
};
