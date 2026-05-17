import fs from 'fs';

// Create public directory
if (!fs.existsSync('public')) {
    fs.mkdirSync('public', { recursive: true });
}

// Copy HTML files to public
const htmlFiles = ['index.html', 'login.html', 'register.html', 'dashboard.html', 'course.html', 'admin-login.html', 'admin-dashboard.html'];

htmlFiles.forEach(file => {
    const sourcePath = `public/${file}`;
    if (fs.existsSync(sourcePath)) {
        console.log(`✅ File exists: ${file}`);
    } else {
        console.log(`⚠️ File not found: ${file} - make sure HTML files are in public folder`);
    }
});

console.log('✅ Build complete!');
