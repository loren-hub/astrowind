# Validación de la entrega

Revisión: 27 de septiembre de 2026. Base: `arthelokyo/astrowind`, commit `14e1a691f80548dcc36370847b1a02c0d0b12821`.

## Comprobaciones realizadas

| Comprobación                          | Resultado                                                            |
| ------------------------------------- | -------------------------------------------------------------------- |
| Instalación con el lockfile entregado | `npm ci` completado                                                  |
| Compilación de Astro                  | Correcta; 7 páginas estáticas                                        |
| Tipos y componentes Astro             | Sin errores, advertencias ni sugerencias                             |
| ESLint y Prettier                     | Comprobados con `npm run check`                                      |
| Pruebas del endpoint de contacto      | 22 pruebas superadas; proveedores simulados                          |
| Empaquetado del Worker                | `wrangler deploy --dry-run` correcto; sin despliegue                 |
| Estructura de la landing compilada    | Un H1, idioma español, IDs únicos y anclas válidas                   |
| Assets y metadatos                    | Rutas locales existentes, Open Graph 1200×630 y JSON-LD válido       |
| JSON-LD                               | Organización, sitio web y seis servicios; ocho nodos                 |
| CSP                                   | Hashes correspondientes a los scripts inline de la compilación final |
| Previsualización                      | `noindex`, cabecera X-Robots-Tag y robots restrictivos               |
| Rutas de demostración                 | Retiradas; salida de compilación limpia                              |

Las pruebas del formulario cubren envío válido, destinatario fijo, origen, validación de campos, duplicados, campos desconocidos, límites del cuerpo, honeypot, privacidad, rate limiting, errores de Turnstile y del proveedor, configuración incompleta, rechazo de claves de prueba en producción y respuestas HTML/JSON. No se ha enviado ningún correo real.

`prebuild` limpia únicamente el directorio generado `dist/`, después de validar la configuración, para impedir que sobrevivan assets de compilaciones anteriores. El script de preparación conserva las demos originales en `.lca-backup/` y no mueve archivos modificados por el usuario.

## Tamaños medidos

Medición local de la landing con formulario visible y clave pública de prueba, antes de añadir scripts de Turnstile en el navegador:

| Recurso                                            | Tamaño sin comprimir |   Gzip local |
| -------------------------------------------------- | -------------------: | -----------: |
| HTML                                               |         40.962 bytes | 11.156 bytes |
| CSS                                                |         25.902 bytes |  5.792 bytes |
| Fuente Inter WOFF2                                 |         72.920 bytes |            — |
| JavaScript inline de interfaz, incluido en el HTML |          2.811 bytes |            — |

La compresión efectiva depende de Cloudflare. Estos tamaños no son una medición de Core Web Vitals ni una puntuación Lighthouse.

## Pendiente en vuestro entorno

No se ha podido abrir un navegador operativo en este entorno, por lo que **la revisión visual en escritorio/móvil y la interacción real con Turnstile siguen pendientes**. La vista previa HTML permite revisar el diseño localmente; su formulario está desactivado y no contiene las claves privadas ni realiza peticiones de contacto.

Tampoco se han verificado vuestro DNS, credenciales, dominio remitente, disponibilidad del binding de correo o entregabilidad. Antes de activar el contacto público, probad desde el dominio final una consulta, su recepción en el buzón y la respuesta al visitante. Completad los datos societarios y revisad los textos legales antes de indexar.

## Repetir las comprobaciones

```bash
npm run check
npm run test:contact
npm run build
npx wrangler deploy --dry-run --outdir .wrangler/dry-run
```

La compilación por defecto muestra contacto por email. Para revisar el formulario, seguid la configuración local de `INTEGRACION.md`. No se incluye ninguna promesa de puntuación Lighthouse, conformidad WCAG, certificación de seguridad ni cumplimiento jurídico automático.
