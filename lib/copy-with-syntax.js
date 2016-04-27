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
  forEachTextNodeIn(lines, (node) => {
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

function forEachTextNodeIn(root, f) {
  if (root.nodeName === '#text') {
    return f(root);
  }
  var childNodes = [].concat.apply([], root.childNodes);
  if (childNodes && childNodes[0] && childNodes[0].style && childNodes[0].style.zIndex) {
    // At the time of writing this plugin, Atom splits text inside the editor
    // into several absolutely-positioned divs with z-index corresponding to
    // visual order
    childNodes.sort((a, b) => (b.style.zIndex - a.style.zIndex));
  }
  for (var i = 0; i < childNodes.length; i++) {
    forEachTextNodeIn(childNodes[i], f);
  }
  if (root.classList.contains('line')) {
    f(null);
  }
}

module.exports = copyWithSyntax;
