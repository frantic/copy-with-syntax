function rgbaToRTF(color) {
  var match = color.match(/rgba?\((\d+), (\d+), (\d+).*/);
  var red = match ? match[1] : 0;
  var green = match ? match[2] : 0;
  var blue = match ? match[3] : 0;
  return `\\red${red}\\green${green}\\blue${blue}`;
}

module.exports = function RTF(fontFamily) {
  var colors = [];
  var lastColor = null;
  var content = '';
  var font = fontFamily.replace(/[' ]/g, '');

  function colorIndexFromTable(color) {
    var index = colors.indexOf(color);
    if (index === -1) {
      index = colors.push(color) - 1;
    }
    return index + 1; // 1-based index
  }

  return {
    append(text, color, style) {
      if (color && color !== lastColor) {
        content += '\\cf' + colorIndexFromTable(color) + ' ';
        lastColor = color;
      }
      text = text
        .replace(/[\\{\}\~]/g, '\\$&')
        .replace(/\n\r/g,' \\line ')
        .replace(/\n/g,' \\line ')
        .replace(/\r/g,' \\line ');

      style = style || {};
      if (style.bold) {
        text = `\\b ${text}\\b0 `;
      }
      if (style.underline) {
        text = `\\ul ${text}\\ul0 `;
      }
      if (style.italic) {
        text = `\\i ${text}\\i0 `;
      }
      content += text;
    },

    finalize() {
      var colortbl = colors.map(rgbaToRTF).join(';');
      var fonttbl = ['Regular', 'Bold', 'Italic'].map(
        (flavor, ii) => `\\f${ii}\\fnil\\fcharset0 ${font}-${flavor};`
      ).join('');

      return [
        '{\\rtf1\\ansi\\ansicpg1252',
        `{\\fonttbl${fonttbl}}`,
        `{\\colortbl;${colortbl};}`,
        `\\f0\\fs24`,
        content,
        '}',
      ].join('\n');
    }
  };
}
