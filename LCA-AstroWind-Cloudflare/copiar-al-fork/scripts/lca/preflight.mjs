import { readFile, access, rm } from 'node:fs/promises';
import { loadEnvFile } from 'node:process';
try {
  loadEnvFile('.env');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const manifest = JSON.parse(await readFile(new URL('./upstream-demo-manifest.json', import.meta.url), 'utf8'));
const remaining = [];
for (const file of Object.keys(manifest)) {
  try {
    await access(file);
    remaining.push(file);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}
if (remaining.length)
  throw new Error(
    `Quedan rutas de la plantilla. Ejecuta npm run prepare:lca y revisa sus avisos:\n${remaining.join('\n')}`
  );
const indexable = process.env.PUBLIC_SITE_INDEXABLE === 'true';
const enabled = process.env.PUBLIC_CONTACT_ENABLED === 'true';
const key = process.env.PUBLIC_TURNSTILE_SITE_KEY || '';
if (enabled && !key) throw new Error('PUBLIC_CONTACT_ENABLED=true requiere PUBLIC_TURNSTILE_SITE_KEY.');
if (indexable && /^[123]x00000000000000000000[A-Z]{2}$/.test(key))
  throw new Error('No uses una clave de prueba de Turnstile en producción.');
if (indexable) {
  const data = await readFile('src/data/lca/site.ts', 'utf8');
  for (const field of ['registeredName', 'taxId', 'address', 'registry']) {
    const match = data.match(new RegExp(`${field}:\\s*(['\x22])([^'\x22]*)\\1`));
    if (!match?.[2].trim())
      throw new Error(`Completa legal.${field} en src/data/lca/site.ts antes de activar la indexación.`);
  }
}
// dist is generated output. Remove stale public assets from earlier template builds.
await rm(new URL('../../dist/', import.meta.url), { recursive: true, force: true });
console.log(
  `LCA: indexación ${indexable ? 'activa' : 'desactivada'}, formulario ${enabled ? 'activo' : 'contacto por email'}.`
);
