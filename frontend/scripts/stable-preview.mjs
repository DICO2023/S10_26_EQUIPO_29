import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, renameSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync, spawn } from 'node:child_process';

// Keep runtime dependencies and compiled assets outside cloud-managed Documents.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const key = createHash('sha256').update(root).digest('hex').slice(0, 12);
const runtime = path.join(tmpdir(), `openbridge-preview-${key}`);
mkdirSync(runtime, { recursive: true });
function copyTree(source, destination) {
  if (statSync(source).isDirectory()) {
    mkdirSync(destination, { recursive: true });
    for (const name of readdirSync(source)) copyTree(path.join(source, name), path.join(destination, name));
  } else {
    let bytes;
    // Cloud-backed files can hydrate between reads. Retry without publishing
    // partial content, while retaining all existing validation guards.
    for(let attempt=0;attempt<5;attempt++){
      const first=readFileSync(source);
      const second=readFileSync(source);
      const validSvg=!source.endsWith('.svg')||first.toString('utf8').trimEnd().endsWith('</svg>');
      if(first.length&&validSvg&&first.equals(second)){bytes=first;break;}
      if(attempt<4)Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,250);
    }
    if(!bytes)throw new Error(`Lectura inestable o incompleta: ${source}. Se conserva la compilación anterior.`);
    writeFileSync(destination, bytes);
  }
}
for (const name of ['package.json', 'package-lock.json', 'index.html', 'src', 'public']) {
  copyTree(path.join(root, name), path.join(runtime, name));
}
// Own config: no source watcher, no config restart, no cloud-hosted modules.
writeFileSync(path.join(runtime, 'preview.config.mjs'), `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\nexport default defineConfig({plugins:[react()],build:{outDir:'candidate'}});\n`);
function run(command, args) {
  const result = spawnSync(command, args, { cwd: runtime, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
const lockHash = createHash('sha256').update(readFileSync(path.join(runtime, 'package-lock.json'))).digest('hex');
const stamp = path.join(runtime, '.installed-lock');
if (!existsSync(stamp) || readFileSync(stamp, 'utf8') !== lockHash || !existsSync(path.join(runtime, 'node_modules/vite/bin/vite.js'))) {
  run('npm', ['ci', '--no-audit', '--no-fund']);
  writeFileSync(stamp, lockHash);
}
const vite = path.join(runtime, 'node_modules/vite/bin/vite.js');
run(process.execPath, [vite, 'build', '--config', 'preview.config.mjs']);
const published = path.join(runtime, 'published');
const previous = path.join(runtime, 'previous');
rmSync(previous, { recursive: true, force: true });
if (existsSync(published)) renameSync(published, previous);
renameSync(path.join(runtime, 'candidate'), published);
console.log(`Vista previa compilada: ${runtime}`);
if (process.argv.includes('--build-only')) process.exit(0);
const server = spawn(process.execPath, [vite, 'preview', '--config', 'preview.config.mjs', '--outDir', 'published', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], { cwd: runtime, stdio: 'inherit' });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.kill(signal));
server.on('exit', code => process.exit(code || 0));
