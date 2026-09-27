# Inventario del paquete

Los siguientes archivos se copian sobre la raíz del fork. Los archivos originales no incluidos permanecen disponibles.

## Archivos que se sustituyen

- `.gitignore`
- `.prettierignore`
- `astro.config.ts`
- `eslint.config.js`
- `package-lock.json`
- `package.json`
- `public/_headers`
- `public/robots.txt`
- `src/components/CustomStyles.astro`
- `src/components/Logo.astro`
- `src/config.yaml`
- `src/navigation.ts`
- `src/pages/404.astro`
- `src/pages/index.astro`
- `src/utils/images.ts`
- `tsconfig.json`
- `wrangler.jsonc`

## Archivos nuevos

- `.dev.vars.example`
- `.env.example`
- `docs/lca/CAMBIOS.md`
- `docs/lca/INTEGRACION.md`
- `docs/lca/SERVICIOS-Y-FUENTES.md`
- `docs/lca/VALIDACION.md`
- `public/_redirects`
- `public/lca/apple-touch-icon.png`
- `public/lca/favicon.svg`
- `public/lca/logo.png`
- `public/lca/og-lca.png`
- `public/lca/og-lca.svg`
- `scripts/lca/generate-brand-assets.mjs`
- `scripts/lca/preflight.mjs`
- `scripts/lca/prepare-fork.mjs`
- `scripts/lca/security-headers.mjs`
- `scripts/lca/upstream-demo-manifest.json`
- `src/assets/styles/lca.css`
- `src/components/lca/AISection.astro`
- `src/components/lca/Brand.astro`
- `src/components/lca/Compliance.astro`
- `src/components/lca/Contact.astro`
- `src/components/lca/FAQ.astro`
- `src/components/lca/Footer.astro`
- `src/components/lca/Header.astro`
- `src/components/lca/Hero.astro`
- `src/components/lca/Insights.astro`
- `src/components/lca/LegalNotice.astro`
- `src/components/lca/Process.astro`
- `src/components/lca/Services.astro`
- `src/data/lca/services.ts`
- `src/data/lca/site.ts`
- `src/layouts/LcaLayout.astro`
- `src/pages/aviso-legal.astro`
- `src/pages/contacto-error.astro`
- `src/pages/cookies.astro`
- `src/pages/gracias.astro`
- `src/pages/privacidad.astro`
- `tests/lca/contact.test.mjs`
- `worker/contact.ts`

## Demos que se archivan

`npm run prepare:lca` mueve las rutas y archivos originales enumerados en `scripts/lca/upstream-demo-manifest.json` a `.lca-backup/`. Compara hashes, conserva los archivos modificados y puede repetirse. Las retiradas deben incluirse en el commit que subas a tu fork.

`package.json` y `package-lock.json` proceden de la versión de referencia. Si tu fork contiene otras dependencias o usa una versión distinta, integra los cambios en lugar de reemplazarlos sin revisar.
