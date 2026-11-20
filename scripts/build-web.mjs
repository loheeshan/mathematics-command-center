import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const web = fileURLToPath(new URL('../apps/web/', import.meta.url));
// Concurrent recursive mkdir calls intermittently return EPERM while Next writes
// segment output on Windows. A single libuv I/O thread avoids that race while
// retaining Next's build workers. Linux/cloud builds keep their normal defaults.
const env = { ...process.env };
if (process.platform === 'win32') env.UV_THREADPOOL_SIZE ??= '1';
const child = spawn(process.execPath, [path.join(web, 'node_modules/next/dist/bin/next'), 'build', ...process.argv.slice(2)], {
  cwd: web, env, stdio: 'inherit', windowsHide: true,
});
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
