import { defineConfig } from 'vite';
import { buildSync } from 'esbuild';
import { cpSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { legacyModules } from './src/legacy-modules';

function compile(entry: string): string {
  const output = buildSync({
    entryPoints: [entry],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: 'es2022',
    write: false,
    minify: true,
    external: ['fs', 'electron'],
  });
  const file = output.outputFiles[0];
  if (!file) throw new Error(`REEO compilation failed: ${entry}`);
  return file.text;
}

/** Serve the typed application shell and compile every legacy module as its own global. */
export default defineConfig({
  root: 'app',
  base: './',
  publicDir: '../public',
  server: { host: '0.0.0.0', allowedHosts: true },
  build: { outDir: '../dist', emptyOutDir: true },
  plugins: [
    {
      name: 'reeo-application-bundles',
      transformIndexHtml: {
        order: 'pre',
        handler(html) {
          const expanded = html.replace(/<!--\s*@include\s+(\S+)\s*-->/g, (_, file: string) =>
            readFileSync(resolve('app', file), 'utf8'),
          );
          const runtime = compile('src/runtime.ts');
          const modules = legacyModules.map((entry) => ({
            tag: 'script',
            children: readFileSync(entry, 'utf8'),
            injectTo: 'body' as const,
          }));
          return {
            html: expanded,
            tags: [{ tag: 'script', children: runtime, injectTo: 'head-prepend' }, ...modules],
          };
        },
      },
      closeBundle() {
        for (const directory of ['img', 'fonts'])
          cpSync(resolve('app', directory), resolve('dist', directory), { recursive: true });
      },
    },
  ],
});
