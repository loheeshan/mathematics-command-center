import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const web = path.join(root, 'apps/web');
const port = process.env.E2E_PORT || '3100';
const server = spawn(process.execPath, [path.join(web, 'node_modules/next/dist/bin/next'), process.env.E2E_DEV === '1' ? 'dev' : 'start', '-p', port, '-H', '127.0.0.1'], {
  cwd: web, env: process.env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
});
let runner;
const stopServer = async () => {
  if (server.exitCode !== null) return;
  // This is the direct Node child, with no command-shell wrapper to leave
  // inherited output handles open on Windows. Only our server is terminated.
  server.kill('SIGTERM');
  server.stdout.destroy();
  server.stderr.destroy();
  server.unref();
};
const interrupt = async () => { runner?.kill(); await stopServer(); process.exit(130); };
process.once('SIGINT', interrupt);
process.once('SIGTERM', interrupt);
try {
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Test server did not become ready within 60 seconds.')), 60000);
    const fail = error => { clearTimeout(timeout); reject(error); };
    server.once('error', fail);
    server.once('exit', code => fail(new Error(`Test server exited before it was ready (${code}). Build the app first.`)));
    server.stderr.on('data', data => process.stderr.write(data));
    server.stdout.on('data', data => {
      process.stdout.write(data);
      if (data.toString().includes('Ready in')) { clearTimeout(timeout); resolve(); }
    });
  });
  runner = spawn(process.execPath, [path.join(root, 'node_modules/@playwright/test/cli.js'), 'test', ...process.argv.slice(2)], {
    cwd: root, env: { ...process.env, E2E_EXTERNAL_SERVER: '1' }, stdio: 'inherit', windowsHide: true,
  });
  process.exitCode = await new Promise((resolve, reject) => { runner.once('error', reject); runner.once('exit', code => resolve(code ?? 1)); });
} catch (error) {
  console.error(error.message); process.exitCode = 1;
} finally { await stopServer(); }
