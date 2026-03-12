const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

walkDir('./src', (filePath) => {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let newContent = content
            .replace(/teal-50/g, 'rose-50')
            .replace(/teal-100/g, 'amber-100')
            .replace(/teal-200/g, 'amber-200')
            .replace(/teal-300/g, 'amber-300')
            .replace(/teal-400/g, 'amber-400')
            .replace(/teal-500/g, 'amber-500')
            .replace(/teal-600/g, 'rose-600')
            .replace(/teal-700/g, 'rose-700');

        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`Updated ${filePath}`);
        }
    }
});
