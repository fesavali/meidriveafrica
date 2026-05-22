// build.js
import esbuild from 'esbuild';
import { copy } from 'esbuild-plugin-copy';
import { html } from 'esbuild-plugin-html';
import fs from 'fs/promises';
import path from 'path';

// Generate nonce for CSP
const nonce = Math.random().toString(36).substring(2, 15);
const version = JSON.parse(await fs.readFile('./package.json', 'utf8')).version;

// Environment variables
const env = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    VERSION: version,
    NONCE: nonce,
    BUILD_TIME: Date.now().toString()
};

// Build configuration
const buildConfig = {
    entryPoints: ['src/main.js'],
    bundle: true,
    minify: true,
    sourcemap: false,
    target: ['chrome100', 'firefox100', 'safari15'],
    outdir: 'dist',
    treeShaking: true,
    legalComments: 'none',
    format: 'esm',
    platform: 'browser',
    define: {
        'process.env.NODE_ENV': '"production"',
        'process.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL),
        'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY),
        '__VERSION__': JSON.stringify(env.VERSION),
        '__NONCE__': JSON.stringify(env.NONCE)
    },
    plugins: [
        copy({
            assets: {
                from: ['./public/**/*'],
                to: ['./']
            }
        }),
        html({
            template: 'index.html',
            inject: {
                data: env,
                tags: [
                    {
                        tag: 'script',
                        attrs: {
                            src: `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/js/all.min.js`,
                            defer: true,
                            integrity: 'sha384-...'
                        }
                    }
                ]
            }
        })
    ],
    loader: {
        '.html': 'copy',
        '.png': 'file',
        '.jpg': 'file',
        '.webp': 'file'
    }
};

// Build
try {
    console.log('Building with esbuild...');
    await esbuild.build(buildConfig);
    console.log('✅ Build complete!');
    
    // Generate sitemap
    await generateSitemap();
    
    // Generate robots.txt
    await generateRobots();
    
} catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
}

async function generateSitemap() {
    const urls = [
        { loc: 'https://meidriveafrica.com/', priority: 1.0 },
        { loc: 'https://meidriveafrica.com/courses', priority: 0.9 },
        { loc: 'https://meidriveafrica.com/dashboard', priority: 0.8 }
    ];
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.map(url => `    <url>
        <loc>${url.loc}</loc>
        <priority>${url.priority}</priority>
    </url>`).join('\n')}
</urlset>`;
    
    await fs.writeFile('./dist/sitemap.xml', sitemap);
}

async function generateRobots() {
    const robots = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /
Disallow: /api/
Sitemap: https://meidriveafrica.com/sitemap.xml`;
    
    await fs.writeFile('./dist/robots.txt', robots);
}
