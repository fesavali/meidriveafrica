import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import EnvironmentPlugin from 'vite-plugin-environment';
import { generateNonce } from './scripts/generate-nonce.js';

export default defineConfig({
    build: {
        outDir: 'dist',
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug']
            }
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['@supabase/supabase-js'],
                    ui: ['@popperjs/core']
                }
            }
        },
        target: 'es2020',
        sourcemap: false
    },
    server: {
        headers: {
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block'
        },
        open: true
    },
    plugins: [
        createHtmlPlugin({
            minify: true,
            inject: {
                data: {
                    NONCE: generateNonce(),
                    SUPABASE_URL: process.env.SUPABASE_URL,
                    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
                    VERSION: process.env.npm_package_version,
                    BUILD_TIME: Date.now(),
                    ENVIRONMENT: process.env.NODE_ENV || 'production'
                }
            }
        }),
        EnvironmentPlugin({
            SUPABASE_URL: process.env.SUPABASE_URL,
            SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
        })
    ]
});
