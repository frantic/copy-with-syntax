var RTF = require('./rtf');
var copy = require('copy-paste');

function copyWithSyntax() {
  // It's a bit of a hack, but we need to find the div that
  // contains all lines inside text editor
  var textEditor = atom.workspace.getActiveTextEditor();
  var el = atom.workspace.viewRegistry.getView(textEditor);
  var lines = findEditorDOM(el.shadowRoot);
  if (!lines) {
    throw new Error('Cound not locate lines DOM inside editor');
  }

  var rtf = RTF(window.getComputedStyle(lines).fontFamily);
  forEachTextNodeIn(lines, (node) => {
    if (!node) {
      return rtf.append('\n');
    }
    if (!node.data) {
      return;
    }

    var style = window.getComputedStyle(node.parentElement);
    rtf.append(node.data, style.color, {
      bold: style.fontWeight === 'bold',
      underline: style.textDecoration === 'underline',
      italic: style.fontStyle === 'italic',
    });
  });

  copy.copy(rtf.finalize());
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

function findEditorDOM(root) {
  if (root.classList && root.classList.contains('lines')) {
    return root;
  }
  for (var i = 0; i < root.children.length; i++) {
    var element = findEditorDOM(root.children[i]);
    if (element) {
      return element;
    }
  }
}

module.exports = copyWithSyntax;
