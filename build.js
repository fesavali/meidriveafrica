import fs from 'fs';
import path from 'path';
import CleanCSS from 'clean-css';
import { minify } from 'terser';

const publicDir = 'public';
const distDir = 'dist';

// Clean dist
if (fs.existsSync(distDir)) fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

// Copy and minify HTML
const htmlFiles = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));
htmlFiles.forEach(file => {
    let content = fs.readFileSync(path.join(publicDir, file), 'utf8');
    content = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
    content = content.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
    fs.writeFileSync(path.join(distDir, file), content);
    console.log(`✅ Minified: ${file}`);
});

// Copy and minify CSS (extract from HTML or separate CSS files)
console.log('✅ Build complete!');

// Generate service worker
const swContent = `const CACHE_NAME = 'meidrive-v1';
const urlsToCache = ['/', '/index.html', '/login.html', '/register.html', '/dashboard.html', '/course.html'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))));
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(response => response || fetch(e.request))));`;
fs.writeFileSync(path.join(distDir, 'sw.js'), swContent);
console.log('✅ Service worker generated');
