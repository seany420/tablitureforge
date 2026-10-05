// Loads the browser modules into Node for testing.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
global.window = global.window || {};
global.Theory = require(path.join(root, 'js/theory.js'));
global.Guitar = require(path.join(root, 'js/guitar.js'));
function loadGlobal(file, name) {
  const src = fs.readFileSync(path.join(root, file), 'utf8') + '\n;return ' + name + ';';
  return new Function('window', 'document', 'Sound', 'Fretboard', src)({}, {}, {}, function () {});
}
global.Tab = loadGlobal('js/tab.js', 'Tab');
module.exports = { root, loadGlobal };
