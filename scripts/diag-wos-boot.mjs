// 裸拉 electron.exe 抓完整启动日志（定位优雅退出原因）
import { spawn } from 'node:child_process';
import { appendFileSync, writeFileSync } from 'node:fs';

const LOG = 'assets/screenshots/_probe/wos-boot.log';
writeFileSync(LOG, '');
const exe = 'D:/Work/myplace/agent-os/node_modules/electron/dist/electron.exe';
const child = spawn(exe, ['D:/Work/myplace/agent-os'], {
  cwd: 'D:/Work/myplace/agent-os',
  env: { ...process.env, ELECTRON_START_URL: 'http://localhost:5175', NODE_ENV: 'development' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let out = '', err = '';
child.stdout.on('data', d => { out += d.toString(); });
child.stderr.on('data', d => { err += d.toString(); });
await new Promise(r => setTimeout(r, 45000));
writeFileSync(LOG, '=== STDOUT ===\n' + out + '\n=== STDERR ===\n' + err);
console.log('--- stdout tail ---');
console.log(out.split('\n').slice(-25).join('\n'));
console.log('--- stderr tail ---');
console.log(err.split('\n').slice(-10).join('\n'));
child.kill();
process.exit(0);
