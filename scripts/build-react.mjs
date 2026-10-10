import { spawnSync } from 'node:child_process';
import { cpSync, rmSync } from 'node:fs';

const r = spawnSync('npm', ['run', 'build'], { cwd: 'sites/react', stdio: 'inherit', shell: true });
if (r.status) process.exit(r.status);
if (r.error) process.exit(1);
rmSync('dist/react', { recursive: true, force: true });
cpSync('sites/react/dist', 'dist/react', { recursive: true });
console.log('dist/react/ 就绪');
