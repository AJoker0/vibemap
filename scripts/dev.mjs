import { spawn } from 'node:child_process'

const packageManager = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
const developmentEnvironment = {
  ...process.env,
  // Keep local development independent from a stale system-level URI.
  MONGODB_URI:
    process.env.VIBEMAP_MONGODB_URI || 'mongodb://localhost:27017/vibemap',
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' })

    child.once('error', reject)
    child.once('exit', (code, signal) => {
      if (code === 0) resolve()
      else reject(new Error(`${command} exited with ${signal || code}`))
    })
  })
}

function spawnPackageScript(script) {
  if (process.platform === 'win32') {
    return spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', `${packageManager} ${script}`], {
      stdio: 'inherit',
      env: developmentEnvironment,
    })
  }

  return spawn(packageManager, [script], {
    stdio: 'inherit',
    env: developmentEnvironment,
  })
}

try {
  // Start MongoDB first so both application processes share the same local database.
  await run('docker', ['compose', 'up', '-d'])
} catch (error) {
  console.error('\nUnable to start MongoDB.')
  console.error('Start Docker Desktop and run `pnpm dev` again.')
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}

const processes = [
  spawnPackageScript('dev:next'),
  spawnPackageScript('dev:api'),
]

function stopProcesses() {
  for (const child of processes) {
    if (!child.killed) child.kill('SIGINT')
  }
}

process.once('SIGINT', stopProcesses)
process.once('SIGTERM', stopProcesses)

for (const child of processes) {
  child.once('exit', (code) => {
    if (code && code !== 130) process.exitCode = code
    stopProcesses()
  })
}
