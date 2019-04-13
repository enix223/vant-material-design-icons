const fs = require('fs-extra');
const path = require('path');

function template(fontName, ttf) {
  return `@font-face {
  font-style: normal;
  font-weight: normal;
  font-family: '${fontName}';
  src: url('${ttf}') format('truetype');
}
`;
}

module.exports = function encode(fontName, srcDir, ttfPath) {
  const ttfBase64 = fs.readFileSync(ttfPath, 'base64');
  fs.writeFileSync(
    path.join(srcDir, 'encode.less'),
    template(fontName, `data:font/ttf;base64,${ttfBase64}`)
  );
};
