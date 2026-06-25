const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'src', 'index.css');
let css = fs.readFileSync(target, 'utf8');
css = css.replace(/calc\(infinity \* 1px\)/g, '9999px');
fs.writeFileSync(target, css);
