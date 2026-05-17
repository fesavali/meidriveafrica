import esbuild from 'esbuild';
import fs from 'fs';

// Clean dist
if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
}
fs.mkdirSync('dist', { recursive: true });
fs.mkdirSync('dist/js', { recursive: true });

// Build with minification
await esbuild.build({
    entryPoints: ['src/supabase.js', 'src/auth.js', 'public/js/auth-guard.js'],
    bundle: true,
    outdir: 'dist/js',
    minify: true,
    sourcemap: false,
    platform: 'browser',
    format: 'esm',
    target: ['chrome58', 'edge16', 'firefox57', 'safari11']
});

console.log('✅ Build complete!');
