// Runs the API (with auto-restart) and the Vite dev server together: `npm run dev:all`
import { spawn } from 'node:child_process';

const isWin = process.platform === 'win32';
const procs = [
  spawn(process.execPath, ['--watch', 'server/index.js'], { stdio: 'inherit' }),
  spawn(isWin ? 'npx.cmd' : 'npx', ['vite'], { stdio: 'inherit', shell: isWin }),
];

const stop = () => {
  procs.forEach((p) => p.kill());
  process.exit();
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
procs.forEach((p) => p.on('exit', (code) => code && stop()));
