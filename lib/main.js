var CompositeDisposable = require('atom').CompositeDisposable;
var copyWithSyntax = require('./copy-with-syntax');

var subscriptions;

module.exports = {
  activate() {
    subscriptions = new CompositeDisposable();
    subscriptions.add(atom.commands.add('atom-workspace', 'copy-with-syntax:copy', copyWithSyntax));
  },

  deactivate() {
    subscriptions.dispose();
  },
};
