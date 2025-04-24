const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const { execSync } = require('child_process');

// Define paths
const buildDir = path.join(__dirname, 'dist');
const sourceDir = path.join(__dirname, 'src');

// Clean and create build directory
fs.removeSync(buildDir);
fs.mkdirSync(buildDir);

try {
    // Backup current changes
    execSync('git stash');

    // Allow unrelated histories merge
    console.log('Fetching remote changes...');
    execSync('git fetch origin');
    
    console.log('Merging remote changes...');
    execSync('git merge origin/main --allow-unrelated-histories');
    
    // Restore your changes
    execSync('git stash pop');
    
    // Add all files
    console.log('Adding files...');
    execSync('git add .');
    
    // Commit
    console.log('Committing changes...');
    execSync('git commit -m "Initial merge with remote repository"');
    
    // Push to remote
    console.log('Pushing to remote...');
    execSync('git push origin main');

    // Check for lock file before Git operations
    if (fs.existsSync('.git/index.lock')) {
        fs.unlinkSync('.git/index.lock');
    }
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
    console.error('Error during deployment:', error);
    // Cleanup if needed
    try {
        execSync('git merge --abort');
        execSync('git stash pop');
    } catch (cleanupError) {
        console.error('Error during cleanup:', cleanupError);
    }
    process.exit(1);
}
