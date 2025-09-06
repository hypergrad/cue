const { minify } = require('terser');
const fs = require('fs');
const path = require('path');

async function minifyFile(inputPath, outputPath) {
  const code = fs.readFileSync(inputPath, 'utf8');
  const result = await minify(code, { compress: true, mangle: true });
  if (result.error) throw result.error;
  fs.writeFileSync(outputPath, result.code, 'utf8');
  console.log(`Minified: ${path.basename(inputPath)} -> ${path.basename(outputPath)}`);
}

(async () => {
  try {
    const base = __dirname;
    await minifyFile(path.join(base, 'content.js'), path.join(base, 'content.min.js'));
    await minifyFile(path.join(base, 'background.js'), path.join(base, 'background.min.js'));
  } catch (e) {
    console.error('Minify failed:', e);
    process.exit(1);
  }
})();