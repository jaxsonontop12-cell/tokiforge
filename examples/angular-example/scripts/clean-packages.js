const fs = require('fs');
const path = require('path');

// Remove src directories from @tokiforge packages to prevent JIT compilation
// BUT keep the dist files which are properly compiled
const packagesDir = path.join(__dirname, '../node_modules/@tokiforge');

['angular', 'core'].forEach(pkgName => {
  const srcDir = path.join(packagesDir, pkgName, 'src');
  // Only remove if it exists and dist exists (meaning package is properly built)
  const distDir = path.join(packagesDir, pkgName, 'dist');
  if (fs.existsSync(srcDir) && fs.existsSync(distDir)) {
    console.log(`Removing ${srcDir} to prevent JIT compilation issues`);
    fs.rmSync(srcDir, { recursive: true, force: true });
  }
});

console.log('Package cleanup complete');

