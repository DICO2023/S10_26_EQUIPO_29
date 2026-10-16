import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { tmpdir, networkInterfaces } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

// Serve only the last published build, never cloud-managed source files.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const key=createHash('sha256').update(root).digest('hex').slice(0,12);
const runtime=path.join(tmpdir(), `openbridge-preview-${key}`);
const vite=path.join(runtime,'node_modules/vite/bin/vite.js');
if(!existsSync(path.join(runtime,'published/index.html'))||!existsSync(vite)){
 console.error('Primero crea la vista estable: npm run preview:stable -- --build-only');
 process.exit(1);
}
for(const addresses of Object.values(networkInterfaces()))for(const address of addresses||[]){
 if(address.family==='IPv4'&&!address.internal)console.log(`Red local: http://${address.address}:4173/`);
}
const server=spawn(process.execPath,[vite,'preview','--config','preview.config.mjs','--outDir','published','--host','0.0.0.0','--port','4173','--strictPort'],{cwd:runtime,stdio:'inherit'});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.kill(signal));
server.on('error',error=>{console.error(error.message);process.exit(1);});
server.on('exit',code=>process.exit(code||0));
