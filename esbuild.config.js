import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/netlify/functions/server.ts'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile: 'dist/netlify/functions/server.js',
  external: ['swagger-ui-express'],
  loader: {
    '.html': 'copy',
    '.css': 'copy',
  },
  minify: true,
});
