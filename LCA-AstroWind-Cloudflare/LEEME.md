# LCA Technology Solutions · Entrega para AstroWind

Landing en español con la paleta de la web actual, servicios IT/IA/ciberseguridad, componentes Astro y contacto mediante Cloudflare Workers, Turnstile y Email Service.

## Empieza aquí

1. Abre `LCA-vista-previa.html` en tu navegador para revisar el diseño. Es un archivo independiente; el formulario no envía datos. No lo copies a `public/`.
2. Crea una rama en tu fork y copia **el contenido** de `copiar-al-fork/` sobre su raíz, respetando las carpetas y los archivos ocultos. Si ya has personalizado tu fork, revisa las diferencias antes de sobrescribir archivos.
3. Ejecuta desde la raíz del fork:

```bash
npm ci
npm run prepare:lca
cp .env.example .env
npm run dev
```

La base comprobada es `arthelokyo/astrowind`, commit `14e1a691f80548dcc36370847b1a02c0d0b12821`, con Astro 7.3.1 y Node >=22.22.3. Las demos originales se archivan en `.lca-backup/`; los archivos modificados se conservan y requieren revisión.

## Documentación

Dentro de `copiar-al-fork/docs/lca/`:

- **INTEGRACION.md**: qué copiar y editar, claves de Turnstile, remitente/destino, Cloudflare y activación de la indexación.
- **SERVICIOS-Y-FUENTES.md**: catálogo priorizado para España y fuentes oficiales consultadas. No se presenta como un ranking estadístico de contratación.
- **VALIDACION.md**: pruebas realizadas y comprobaciones pendientes.
- **CAMBIOS.md**: inventario de archivos que se añaden o sustituyen.

## Antes de producción

Completa los datos societarios de `src/data/lca/site.ts` y revisa los borradores legales. Configura Turnstile, un destinatario verificado y el remitente de Cloudflare. Conserva los MX del correo corporativo existente.

Por defecto, la indexación y el formulario están desactivados y se ofrece contacto por email. Activa los dos interruptores del formulario —compilación y Worker— cuando tengas el backend preparado. `INTEGRACION.md` explica la configuración completa y el despliegue; no se ha publicado nada en tu cuenta.

Compilación, comprobaciones de Astro/lint y 22 pruebas del endpoint realizadas. La revisión visual en navegador, Turnstile real y la entrega de correo deben comprobarse en vuestro entorno. El identificador tipográfico `lca.` es una propuesta editable; reemplázalo por vuestro logotipo definitivo si procede.
