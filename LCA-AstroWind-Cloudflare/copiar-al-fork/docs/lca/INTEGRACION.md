# LCA Technology Solutions · Integración en AstroWind

Revisión: 27 de septiembre de 2026.

Este paquete adapta el repositorio `arthelokyo/astrowind` a una landing de consultoría informática y ciberseguridad en España. Está preparado para **Astro estático + Cloudflare Workers Static Assets + Turnstile + Email Service**. El Worker solo procesa `/api/*`; las páginas se sirven como archivos estáticos. No requiere un adaptador SSR, una base de datos ni un proveedor externo de formularios.

## 1. Qué copiar

El ZIP contiene `copiar-al-fork/`: copia **su contenido** sobre la raíz de tu fork, conservando la estructura. Incluye archivos ocultos de ejemplo y configuración. No copies `LCA-vista-previa.html` dentro de `public/`: es una muestra local independiente.

Base comprobada:

- Repositorio: <https://github.com/arthelokyo/astrowind>
- Commit: `14e1a691f80548dcc36370847b1a02c0d0b12821`
- Astro `7.3.1`, Tailwind `4`, Node `>=22.22.3`.
- Wrangler fijado a `4.141.0` en `package.json` y `package-lock.json`.

Se entregan `package.json`, su lockfile y las configuraciones completas del fork de referencia. Si ya has incorporado otras dependencias, páginas o cambios en tu fork, integra sus diferencias antes de sobrescribirlos. El archivo `CAMBIOS.md` enumera los archivos del paquete.

Desde la raíz de tu fork, después de copiar:

```bash
npm ci
npm run prepare:lca
cp .env.example .env
npm run dev
```

Abre `http://localhost:4321`. Por defecto verás la landing con contacto por email; no se muestra un formulario sin configurar.

`prepare:lca` mueve las rutas de demostración y el CMS de ejemplo a `.lca-backup/`. Comprueba sus hashes contra el commit de referencia: **solo archiva archivos originales sin modificaciones**. Si encuentra una demo modificada, la conserva y te indica cuál debes revisar. No elimina tu contenido. `prebuild` detecta rutas de ejemplo pendientes antes de compilar. Si tu fork usa otra versión, revisa esas rutas y muévelas manualmente fuera de `src/pages/`; no cambies los hashes para ocultar cambios.

## 2. Dónde editar

| Contenido                                          | Archivo                             |
| -------------------------------------------------- | ----------------------------------- |
| Empresa, email, LinkedIn, preguntas y perspectivas | `src/data/lca/site.ts`              |
| Servicios, textos y opciones del formulario        | `src/data/lca/services.ts`          |
| Orden de secciones, título y JSON-LD               | `src/pages/index.astro`             |
| Colores y estilos de la landing                    | `src/assets/styles/lca.css`         |
| Colores de los widgets originales de AstroWind     | `src/components/CustomStyles.astro` |
| Dominio y metadatos generales                      | `src/config.yaml`                   |
| Navegación para los layouts originales             | `src/navigation.ts`                 |
| Componentes de la landing                          | `src/components/lca/`               |
| Envío del formulario                               | `worker/contact.ts`                 |
| Bindings, remitente, destinatario y orígenes       | `wrangler.jsonc`                    |
| Imagen social y favicon                            | `public/lca/`                       |

La paleta procede del CSS de vuestra web: `#001517`, `#009589`, `#46D37D`, `#FAFCFC`, `#F1F6F6` y `#D7E0DF`. Se añade `#006B63` para textos y enlaces sobre fondos claros. El identificador tipográfico `lca.` y los iconos de sitio son una propuesta editable; sustituye estos activos por vuestro logotipo vectorial definitivo si lo tenéis.

## 3. Activar el formulario

### Turnstile

Crea un widget **Managed** en Cloudflare Turnstile. Añade el dominio real `lcatechnologysolutions.com` y `www` solo si vas a utilizarlo. Mantén desactivado **pre-clearance** para esta configuración. Obtendrás una site key pública y una secret key privada.

En `.env` o en las variables de compilación de Cloudflare:

```dotenv
PUBLIC_CONTACT_ENABLED=true
PUBLIC_TURNSTILE_SITE_KEY=TU_SITE_KEY_REAL
PUBLIC_SITE_INDEXABLE=false
```

La clave pública forma parte del HTML. La secret key **no** lleva prefijo `PUBLIC_` ni se guarda en el repositorio.

### Correo en Cloudflare

1. Verifica `info@lcatechnologysolutions.com` como dirección de destino en Email Service / Email Routing. Si utilizas otro buzón receptor, cambia **tanto** `CONTACT_TO` como `send_email.destination_address` en `wrangler.jsonc`.
2. Habilita el remitente en un dominio o subdominio incorporado a Email Service. El ejemplo utiliza `web@forms.lcatechnologysolutions.com`.
3. Configura los registros DNS que indique Cloudflare para **ese subdominio**. Si el dominio principal recibe correo mediante Microsoft 365 u otro proveedor, conserva sus MX: no actives un asistente que los sustituya. Cloudflare documenta incorporación independiente de subdominios para Email Sending; para Email Routing, comprueba el alcance de los cambios propuestos por el panel.
4. Añade la secret key al Worker mediante el panel o con:

```bash
npx wrangler login
npx wrangler secret put TURNSTILE_SECRET_KEY
```

Si el Worker todavía no existe, puedes crearlo primero desde el panel con el nombre de `wrangler.jsonc`, o realizar un primer despliegue con contacto desactivado. Para un primer despliegue solo estático sin haber verificado el correo, omite temporalmente `send_email` y conserva ambos interruptores de contacto en `false`.

5. Cambia `vars.CONTACT_ENABLED` a `"true"` en `wrangler.jsonc` cuando los bindings y la clave estén preparados. El interruptor del Worker y `PUBLIC_CONTACT_ENABLED` son independientes: uno habilita el endpoint y otro muestra el formulario.
6. Revisa `ALLOWED_ORIGINS`: contiene orígenes completos, con protocolo y sin barra final. Si pruebas un subdominio de staging o `workers.dev`, añádelo explícitamente y autorízalo también en Turnstile.
7. Elige un `namespace_id` de rate limiting que no utilice otro Worker de tu cuenta. `1001` es un ejemplo; los contadores se comparten cuando se reutiliza el mismo espacio.

El visitante controla exclusivamente el `Reply-To`. El remitente y el destinatario son valores del servidor y el binding limita el destino. Se envía un único correo interno; no se envían confirmaciones automáticas al visitante. La API estructurada de Email Service utilizada está documentada en septiembre de 2026. El acceso al envío general y sus precios dependen del plan; el envío a destinos verificados está documentado por Cloudflare como disponible sin coste también con Email Routing. Comprueba la disponibilidad y configuración concreta de tu cuenta antes del lanzamiento.

### Prueba local

`astro dev` y `astro preview` sirven el frontend; no ejecutan `worker/contact.ts`.

Para probar la interfaz con claves públicas de prueba, conserva la indexación en `false` y usa en `.env`:

```dotenv
PUBLIC_SITE_INDEXABLE=false
PUBLIC_CONTACT_ENABLED=true
PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
```

Después:

```bash
cp .dev.vars.example .dev.vars
npm run build
npm run preview:cloudflare
```

Abre `http://localhost:8787`. `.dev.vars` contiene una clave de prueba pública de Cloudflare y queda ignorado por Git. El simulador de correo puede registrar mensajes localmente; esto **no** acredita que se hayan entregado al buzón real. No actives bindings remotos si solo quieres una prueba local.

El Worker solo admite la excepción de hostname de las claves de prueba en `localhost` o `127.0.0.1` con `ENVIRONMENT=development`. Rechaza las claves secretas de prueba fuera de ese contexto. Al terminar, restablece las claves reales para el despliegue.

## 4. Publicar en Cloudflare

Opción recomendada: **Workers**, coherente con `wrangler.jsonc` y con la parte de contacto. No selecciones Pages para este paquete sin adaptar el backend.

Conecta tu fork en Cloudflare Workers Builds:

| Ajuste               | Valor                                 |
| -------------------- | ------------------------------------- |
| Directorio raíz      | Raíz del fork                         |
| Versión de Node      | `22.22.3` o posterior compatible      |
| Compilación          | `npm run build`                       |
| Despliegue           | `npx wrangler deploy`                 |
| Directorio de assets | `dist`, ya declarado en Wrangler      |
| Variables públicas   | Las tres `PUBLIC_*` de `.env.example` |
| Secret runtime       | `TURNSTILE_SECRET_KEY`                |

Ejecuta `prepare:lca` localmente y sube a Git los cambios, **incluida la retirada de las demos**, antes de activar Workers Builds. `.lca-backup/` no se sube. En un clon limpio, `prebuild` no deberá encontrar esas rutas.

Despliegue manual:

```bash
npm run check
npm run test:contact
npm run deploy:cloudflare
```

`npm run build` incluye el paso que genera las cabeceras CSP y `robots.txt`; no lo sustituyas por `astro build` directamente. No se ha publicado ningún Worker ni modificado vuestro DNS al preparar este paquete.

En el panel del Worker, añade el dominio personalizado. Define un único dominio canónico y redirige `www` al principal con una Redirect Rule de Cloudflare. Activa HTTPS. Evita Rocket Loader o transformaciones del HTML/JavaScript que cambien los scripts después de calcular los hashes CSP.

Antes de dar por operativo el contacto, realiza una consulta de prueba desde el dominio final y comprueba recepción y respuesta en el buzón. La validación local y el dry run no pueden confirmar DNS, autenticación del dominio ni entregabilidad.

## 5. Publicación e indexación

En `src/data/lca/site.ts`, completa `legal.registeredName`, `taxId`, `address` y `registry`. La web actual contiene datos identificativos pendientes; se han mantenido como borrador, sin inventarlos. Confirma además los tratamientos reales, el proveedor del buzón, los plazos de conservación y los contratos con proveedores en los textos legales.

Después establece:

```dotenv
PUBLIC_SITE_INDEXABLE=true
```

La compilación impide activar la indexación con campos identificativos vacíos. Comprueba la URL final, el contenido legal y la oferta que vais a prestar antes de activar este valor. En previews, mantenlo en `false`: se generan `noindex`, `X-Robots-Tag` y `robots.txt` restrictivos. Estas directivas no son un control de acceso; usa Cloudflare Access si el staging debe ser privado.

El sitemap incluye únicamente la landing. Las páginas legales, de error y de confirmación declaran `noindex`. Cuando añadas páginas de servicios o un blog propio, amplía el filtro de `sitemap()` en `astro.config.ts`. Los fragmentos `#servicio-*` ayudan a navegar, pero no son páginas SEO independientes.

## 6. Decisiones de implementación

- Componentes `.astro` con datos tipados y HTML generado en compilación. No hay React ni hidratación de componentes de presentación.
- Se reutilizan la configuración, metadatos, JSON-LD, fuentes nativas e iconos de AstroWind. El layout de LCA separa el diseño corporativo de las demos; los widgets originales siguen disponibles para ampliar el proyecto.
- Inter variable autoalojada por la API Fonts de Astro. Iconos SVG incluidos en el HTML. Sin imágenes remotas, vídeos de fondo, carruseles ni embeds de LinkedIn.
- Solo hay JavaScript para el menú móvil y la mejora del formulario. El contenido, las preguntas y la navegación básica funcionan sin JavaScript. El contacto por email queda disponible siempre.
- Turnstile se carga cuando se empieza a utilizar el formulario. El token se valida en servidor, incluyendo hostname y acción; no basta con el widget visible.
- El backend limita el cuerpo real a 16 KiB, valida los campos, rechaza duplicados, aplica honeypot y rate limiting y no registra el mensaje ni los tokens. El límite de Cloudflare es por localización de red, no una cuota global.
- El correo usa texto plano y destinatario fijo. Un fallo de verificación o envío devuelve un error; no se simula éxito.
- No se persisten consultas en D1/KV. Si falla el envío, no existe cola de reintentos; el visitante recibe un error y tiene la alternativa del email. Un timeout de red puede dejar incierto si el envío llegó a completarse, y un reintento manual puede duplicarlo.
- `Organization`, `WebSite` y `Service` en JSON-LD; sin reseñas, certificaciones, clientes o cifras de éxito inventados. No se promete un resultado enriquecido para las FAQ.
- Canonical, `es`/`es_ES`, Open Graph 1200×630 real, favicon, sitemap y redirecciones de rutas de la plantilla. Los encabezados de seguridad se aplican a assets; el Worker añade sus propios encabezados a la API.
- Diseño adaptable, un único H1, enlace de salto, labels, foco visible, acordeones nativos y respeto a movimiento reducido. La revisión visual en navegador queda pendiente por limitaciones del entorno de ejecución; no se afirma conformidad WCAG ni una puntuación Lighthouse.

## 7. Ampliaciones recomendadas

Cuando tengáis contenido propio suficiente, cread páginas específicas para IA y automatización, ciberseguridad gestionada, pentesting y cumplimiento. Utilizad casos reales aprobados y entregables concretos. Un blog pequeño con análisis originales puede aprovechar las Content Collections de AstroWind; antes de reactivarlo, sustituye todos los posts de ejemplo y restaura únicamente las rutas que necesites de `.lca-backup/` o del upstream.

La lista de servicios y su fundamento están en `SERVICIOS-Y-FUENTES.md`. Los resultados de las comprobaciones están en `VALIDACION.md`.
