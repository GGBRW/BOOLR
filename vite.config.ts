import { defineConfig } from 'vite';
import { buildSync } from 'esbuild';
import { cpSync } from 'node:fs';
import { resolve } from 'node:path';

/** Keep the original classic-script load order and UI; compile only the new typed boundary. */
export default defineConfig({
  root: 'app',
  base: './',
  publicDir: '../public',
  server: { host: '0.0.0.0', allowedHosts: true },
  build: { outDir: '../dist', emptyOutDir: true },
  plugins: [
    {
      name: 'reeo-original-interface',
      transformIndexHtml: {
        order: 'pre',
        handler() {
          const output = buildSync({
            entryPoints: ['src/runtime.ts'],
            bundle: true,
            format: 'iife',
            platform: 'browser',
            target: 'es2022',
            write: false,
            minify: true,
          });
          const bootstrap = output.outputFiles[0];
          if (!bootstrap) throw new Error('REEO runtime compilation failed');
          return [{ tag: 'script', children: bootstrap.text, injectTo: 'head-prepend' }];
        },
      },
      closeBundle() {
        for (const directory of ['js', 'img', 'fonts'])
          cpSync(resolve('app', directory), resolve('dist', directory), { recursive: true });
      },
    },
  ],
});
