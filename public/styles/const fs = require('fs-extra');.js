const fs = require('fs-extra');
const path = require('path');

const createBackup = async () => {
    const timestamp = new Date().toISOString().replace(/[:]/g, '-').split('.')[0];
    const backupDir = path.join(__dirname, '../backups', `backup-${timestamp}`);
    
    try {
        // Create backups directory if it doesn't exist
        await fs.ensureDir(path.join(__dirname, '../backups'));
        
        // Copy project files to backup directory
        await fs.copy(path.join(__dirname, '..'), backupDir, {
            filter: (src) => {
                // Exclude node_modules, backups, and dist folders
                return !src.includes('node_modules') && 
                       !src.includes('backups') && 
                       !src.includes('dist');
            }
        });
        
        console.log(`Backup created successfully at: ${backupDir}`);
    } catch (err) {
        console.error('Backup failed:', err);
    }
};

createBackup();
