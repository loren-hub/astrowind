import { readFile, mkdir, rename, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const manifest = JSON.parse(await readFile(new URL('./upstream-demo-manifest.json', import.meta.url), 'utf8'));
let blocked = false;
for (const [relative, expected] of Object.entries(manifest)) {
  const file = resolve(root, relative);
  let content;
  try {
    content = await readFile(file);
  } catch (error) {
    if (error.code === 'ENOENT') continue;
    throw error;
  }
  if (createHash('sha256').update(content).digest('hex') !== expected) {
    console.error(
      `Conservado por contener cambios: ${relative}. Revisa esta ruta y muévela fuera de src/pages si no debe publicarse.`
    );
    blocked = true;
    continue;
  }
  const backup = resolve(root, '.lca-backup', relative);
  try {
    await access(backup);
    console.error(`Ya existe una copia: ${backup}. No se ha sobrescrito.`);
    blocked = true;
    continue;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  await mkdir(dirname(backup), { recursive: true });
  await rename(file, backup);
  console.log(`Archivado: ${relative}`);
}
if (blocked) process.exitCode = 1;
else console.log('Preparación completada. Las demos originales se conservan en .lca-backup/.');
