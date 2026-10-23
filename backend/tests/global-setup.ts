import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import path from 'node:path';

/** Base de test vierge et compilation TypeScript isolée, une seule fois pour toute la suite. */
export default function globalSetup() {
  const root = path.resolve(__dirname, '..');
  for (const file of ['test.db', 'test.db-wal', 'test.db-shm']) rmSync(path.join(root, '.tmp', file), { force: true });

  execFileSync(process.execPath, [require.resolve('typescript/bin/tsc'), '-p', 'tsconfig.json', '--outDir', '.tmp/test-dist'], {
    cwd: root,
    stdio: 'inherit',
  });
}
