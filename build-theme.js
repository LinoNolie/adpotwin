const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');

// Define theme directory
const themeDir = path.join(__dirname, 'adpot');

// Clean and create theme directory
fs.removeSync(themeDir);
fs.mkdirSync(themeDir);

// Create style.css first (WordPress requires this)
const styleContent = `/*
Theme Name: AdPotWin
Theme URI: https://adpot.win
Description: AdPotWin Lottery Platform Theme
Version: 1.0
Author: AdPot Team
Template: twentytwentythree
License: GNU General Public License v2 or later
Text Domain: adpotwin
*/`;

fs.writeFileSync(path.join(themeDir, 'style.css'), styleContent);

// Create directories
const directories = [
    'assets/js',
    'assets/css',
    'assets/icons',
    'assets/img'
];

directories.forEach(dir => {
    fs.mkdirSync(path.join(themeDir, dir), { recursive: true });
});

// Create templates directory
fs.mkdirSync(path.join(themeDir, 'templates'));

// Create template index file
const templateIndexContent = `<!-- wp:template-part {"slug":"header","tagName":"header"} /-->
<!-- wp:group {"tagName":"main"} -->
<main class="wp-block-group">
    <?php get_template_part('template-parts/content'); ?>
</main>
<!-- /wp:group -->
<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->`;

fs.writeFileSync(path.join(themeDir, 'templates/index.html'), templateIndexContent);

// Copy files
const filesToCopy = [
    { from: 'src/scripts/userDataManager.js', to: 'assets/js/userDataManager.js' },
    { from: 'src/scripts/paymentProcessor.js', to: 'assets/js/paymentProcessor.js' },
    { from: 'src/scripts/pot-timers.js', to: 'assets/js/pot-timers.js' },
    { from: 'src/styles/index.css', to: 'assets/css/index.css' },
    { from: 'src/styles/cashout.css', to: 'assets/css/cashout.css' },
    { from: 'src/styles/slot-animation.css', to: 'assets/css/slot-animation.css' }
];

filesToCopy.forEach(({ from, to }) => {
    fs.copySync(
        path.join(__dirname, from),
        path.join(themeDir, to)
    );
});

// Copy icons
fs.copySync(
    path.join(__dirname, 'public/assets/icons'),
    path.join(themeDir, 'assets/icons')
);

// Create screenshot
fs.copySync(
    path.join(__dirname, 'public/assets/logo.png'),
    path.join(themeDir, 'screenshot.png')
);

// Create zip file
const output = fs.createWriteStream(path.join(__dirname, 'adpotwin.zip'));
const archive = archiver('zip');

archive.on('error', (err) => {
    throw err;
});

archive.pipe(output);

// Add files to zip WITHOUT the parent directory
archive.directory(themeDir, false);

archive.finalize();

console.log('Building theme zip...');
output.on('close', () => {
    console.log('Theme zip created successfully!');
});