const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');

// Define paths
const buildDir = path.join(__dirname, 'dist');
const sourceDir = path.join(__dirname, 'src');

// Clean and create build directory
fs.removeSync(buildDir);
fs.mkdirSync(buildDir);

try {
    // Copy main files and directories
    fs.copySync(sourceDir, buildDir);
    fs.copyFileSync(path.join(__dirname, 'CNAME'), path.join(buildDir, 'CNAME'));

    // Create zip file
    const output = fs.createWriteStream(path.join(__dirname, 'adpot-porkbun.zip'));
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
        console.log('Build complete! Upload adpot-porkbun.zip to Porkbun');
    });

    archive.on('error', (err) => {
        throw err;
    });

    archive.pipe(output);
    archive.directory(buildDir, false);
    archive.finalize();

} catch (error) {
    console.error('Build failed:', error);
}
