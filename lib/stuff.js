var RTF = require('rtf');
var Format = require('rtf/lib/Format');
var RGB = require('rtf/lib/RGB');
var fs = require('fs');

var RGBCache = {};
function toRGB(color) {
  if (typeof RGBCache[color] === 'undefined') {
    var match = color.match(/rgb\((\d+), (\d+), (\d+)\)/);
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
  traverse(lines, function(node, parent) {
    if (!node) {
      return doc.addLine();
    }
    // console.log(node, node.nodeName);
    // window.lastN = node;

    var txt = '';
    if (node.nodeName === '#text') {
      txt = node.data;
    } else {
      txt = node.innerText;

      var style = window.getComputedStyle(node);
      console.log(txt, style.color);
      if (style.color !== lastColor) {
        console.log(style.color, lastColor);
        lastColor = style.color;
        lastFmt = new Format();
        lastFmt.font = style.fontFamily.replace("'", '');
        lastFmt.color = toRGB(style.color);
      }
    }
    doc.writeText(txt, lastFmt);
  });
  doc.createDocument(
    function(err, output){
      console.log(output);
      fs.writeFile('/tmp/formatting.rtf', output, function (err) {
        if (err) return console.log(err);
      });
    }
  );
  window.ed = ed;
}

function traverse(root, f) {
  if (root.children.length === 0) {
    return f(root);
  }
  for (var i = 0; i < root.children.length; i++) {
    traverse(root.children[i], f);
  }
  if (root.className === 'line') {
    f(null);
  }
}

module.exports = copyWithSyntax;
