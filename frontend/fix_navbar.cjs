const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

let modifiedCount = 0;

for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    let original = content;
    
    // Remove import Navbar from '../components/Navbar';
    content = content.replace(/import Navbar from '\.\.\/components\/Navbar';\r?\n?/g, '');
    
    // Remove <Navbar /> taking into account whitespace
    content = content.replace(/<Navbar \/>\r?\n?/g, '');
    content = content.replace(/[ \t]*<Navbar \/>[ \t]*\r?\n?/g, '');
    
    if (original !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
        modifiedCount++;
    }
}

console.log(`Total files modified: ${modifiedCount}`);
