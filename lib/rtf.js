module.exports = function RTF(fontFamily) {
  var colors = [];
  var lastColor = null;
  var content = '';

  function colorIndexFromTable(color) {
    var index = colors.indexOf(color);
    if (index === -1) {
      index = colors.push(color) - 1;
    }
    return index + 1; // 1-based index
  }

  function rgbaToRTF(color) {
    var match = color.match(/rgba?\((\d+), (\d+), (\d+).*/);
    if (!match) {
      console.warn(`can't parse color ${color}`);
    }
    var red = match ? match[1] : 0;
    var green = match ? match[2] : 0;
    var blue = match ? match[3] : 0;
    return `\\red${red}\\green${green}\\blue${blue}`;
  }

  return {
    append(text, color) {
      if (color && color !== lastColor) {
        content += '\\cf' + colorIndexFromTable(color) + ' ';
        lastColor = color;
      }
      content += text
        .replace(/[\\{\}\~]/g, '\\$&')
        .replace(/\n\r/g,' \\line ')
        .replace(/\n/g,' \\line ')
        .replace(/\r/g,' \\line ');
    },

    finalize() {
      var colortbl = colors.map(rgbaToRTF).join(';');
      var font = fontFamily.replace(/[' ]/, '') + '-Regular';

      return [
        '{\\rtf1\\ansi\\ansicpg1252\\cocoartf1404\\cocoasubrtf460',
        `{\\fonttbl\\f0\\fnil\\fcharset0 ${font};}`,
        `{\\colortbl;${colortbl};}`,
        `\\f0\\fs24`,
        content,
        '}',
      ].join('\n');
    }
  };
}
