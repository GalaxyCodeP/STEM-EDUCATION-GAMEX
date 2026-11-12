import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// BASE_PATH: sub-path the site is served from (e.g. "/STEM-EDUCATION-GAMEX/" on GitHub Pages).
// Defaults to "/" so local dev and other hosts behave exactly as before.
const base = process.env.BASE_PATH || '/';

// The source refers to public files with absolute paths ("/assets/..."). Vite only rewrites
// those inside CSS files, so when deploying under a sub-path we prefix the ones in TS/TSX too.
const prefixPublicAssetPaths = () => ({
  name: 'prefix-public-asset-paths',
  enforce: 'pre' as const,
  transform(code: string, id: string) {
    if (base === '/' || id.includes('node_modules') || !/\.(ts|tsx)(\?|$)/.test(id)) return null;
    if (!code.includes('/assets/')) return null;
    return { code: code.replace(/(["'`(])\/assets\//g, `$1${base}assets/`), map: null };
  },
});

export default defineConfig(() => {
  return {
    base,
    plugins: [prefixPublicAssetPaths(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api/tts': {
          target: 'https://translate.google.com',
          changeOrigin: true,
          rewrite: (path) =>
            path.replace(/^\/api\/tts(\?.*)?$/, (_m, q) => '/translate_tts?ie=UTF-8&tl=th&client=tw-ob&' + (q ? q.slice(1) : '')),
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Referer': 'https://translate.google.com/',
          },
        },
      },
    },
  };
});
