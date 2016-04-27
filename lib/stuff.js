var fs = require('fs');
var RTF = require('./rtf');
var copy = require('copy-paste');

function copyWithSyntax() {
  var textEditor = atom.workspace.getActiveTextEditor();
  var el = atom.workspace.viewRegistry.getView(textEditor);
  var ed = el.shadowRoot.firstChild.nextSibling.nextSibling.children[0];
  var lines = ed.children[2].children[1];
  window.ed = ed;

  var rtf = RTF('Menlo');
  traverse(lines, function(node) {
    if (!node) {
      return rtf.append('\n');
    }
    if (!node.data) {
      return;
    }

    var style = window.getComputedStyle(node.parentElement);
    rtf.append(node.data, style.color);
  });

  copy.copy(rtf.finalize());
  fs.writeFileSync('/tmp/rrr.rtf', rtf.finalize());
}

function traverse(root, f) {
  if (root.nodeName === '#text') {
    return f(root);
  }
  var childNodes = [].concat.apply([], root.childNodes);
  if (childNodes && childNodes[0] && childNodes[0].style && childNodes[0].style.zIndex) {
    childNodes.sort((a, b) => (b.style.zIndex - a.style.zIndex));
  }
  for (var i = 0; i < childNodes.length; i++) {
    traverse(childNodes[i], f);
  }
  if (root.classList.contains('line')) {
    f(null);
  }
}

module.exports = copyWithSyntax;
