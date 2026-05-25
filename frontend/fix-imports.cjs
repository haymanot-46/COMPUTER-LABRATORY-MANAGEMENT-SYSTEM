const fs = require('fs');
const path = require('path');

function walkDir(dir, files) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walkDir(fullPath, files);
        } else if (entry.name.endsWith('.jsx') || entry.name.endsWith('.js')) {
            files.push(fullPath);
        }
    }
}

const root = 'src';
const allFiles = [];
walkDir(root, allFiles);

let fixed = 0;
for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const dir = path.dirname(file);
    const relativeDir = path.relative(root, dir);
    const depth = relativeDir ? relativeDir.split(/[\/\\]/).length : 0;
    
    const correctPrefix = '../'.repeat(depth) + 'hooks';
    
    let newContent = content.replace(
        /from\s+['"]((?:\.\.\/)+)hooks['"]/g,
        (match, prefix) => {
            const currentAttempt = prefix + 'hooks';
            if (currentAttempt !== correctPrefix) {
                return "from '" + correctPrefix + "'";
            }
            return match;
        }
    );
    
    if (newContent !== content) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log('Fixed: ' + file.replace(/\\/g, '/') + ' -> ' + correctPrefix);
        fixed++;
    }
}

console.log('\nFixed ' + fixed + ' files');
