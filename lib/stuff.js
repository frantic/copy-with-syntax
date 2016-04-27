var RTF = require('rtf');
var Format = require('rtf/lib/Format');
var RGB = require('rtf/lib/RGB');
var fs = require('fs');

var RGBCache = {};
function toRGB(color) {
  if (typeof RGBCache[color] === 'undefined') {
    var match = color.match(/rgb\((\d+), (\d+), (\d+)/);
    if (match) {
      RGBCache[color] = new RGB(Number(match[1]), Number(match[2]), Number(match[3]));
    } else {
      RGBCache[color] = new RGB(0, 0, 0);
    }
  }
  return RGBCache[color];
}

function copyWithSyntax() {
  console.log('yay');
  var textEditor = atom.workspace.getActiveTextEditor();
  var el = atom.workspace.viewRegistry.getView(textEditor);
  var ed = el.shadowRoot.firstChild.nextSibling.nextSibling.children[0];
  var lines = ed.children[2].children[1];
  var code = '';
  var doc = new RTF();
  var lastColor = null;
  var lastFmt = new Format();
  var all = '';
  traverse(lines, function(node) {
    if (!node) {
      all += '\n';
      return doc.addLine();
    }
    if (!node.data) {
      return;
    }
    // console.log(node, node.nodeName);
    // window.lastN = node;

    var style = window.getComputedStyle(node.parentElement);
    if (style.color !== lastColor) {
      lastColor = style.color;
      lastFmt = new Format();
      lastFmt.font = style.fontFamily
        .replaceAll("'", '')
        .replaceAll(" ", '') + '-Regular';
      lastFmt.color = toRGB(style.color);
    }
    // ' ' is required, RTF (or rtf npm module) is stupid
    doc.writeText(' ' + node.data, lastFmt);
    all += node.data;
  });

  console.log(all);

  doc.createDocument(
    function(err, output){
      fs.writeFile('/tmp/formatting.rtf', output, function (err) {
        if (err) return console.log(err);
      });
    }
  );
  window.ed = ed;
}

function traverse(root, f) {
  if (root.nodeName === '#text') {
    return f(root);
  }
  var childNodes = [].concat.apply([], root.childNodes);
  if (childNodes && childNodes[0] && childNodes[0].style && childNodes[0].style.zIndex) {
    console.log('SORTED!');
    childNodes.sort(
      (a, b) => (Number(b.style.zIndex) - Number(a.style.zIndex))
    );
    console.log(childNodes.map(n => n.style.zIndex));
  }
  for (var i = 0; i < childNodes.length; i++) {
    traverse(childNodes[i], f);
  }
  if (root.classList.contains('line')) {
    f(null);
  }
}

module.exports = copyWithSyntax;
