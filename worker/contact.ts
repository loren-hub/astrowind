import { serviceNames } from '../src/data/lca/services.ts';

export interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  EMAIL: {
    send: (message: { to: string; from: string; replyTo: string; subject: string; text: string }) => Promise<unknown>;
  };
  CONTACT_RATE_LIMITER: { limit: (options: { key: string }) => Promise<{ success: boolean }> };
  CONTACT_ENABLED: string;
  ALLOWED_ORIGINS: string;
  TURNSTILE_SECRET_KEY: string;
  CONTACT_TO: string;
  CONTACT_FROM: string;
  ENVIRONMENT?: string;
}

const MAX_BODY = 16_384;
const noCacheHeaders = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Robots-Tag': 'noindex, nofollow',
};
const emailPattern =
  /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/;
const validEmail = (value: string) => value.length <= 254 && emailPattern.test(value);
const hasControl = (value: string) =>
  Array.from(value).some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127);

function reply(request: Request, status: number, message: string, extraHeaders: Record<string, string> = {}) {
  if (
    status !== 405 &&
    request.headers.get('Accept')?.includes('text/html') &&
    !request.headers.get('Accept')?.includes('application/json')
  ) {
    return new Response(null, {
      status: 303,
      headers: { ...noCacheHeaders, ...extraHeaders, Location: status === 200 ? '/gracias' : '/contacto-error' },
    });
  }
  return Response.json({ ok: status === 200, message }, { status, headers: { ...noCacheHeaders, ...extraHeaders } });
}

async function boundedBody(request: Request): Promise<string> {
  if (Number(request.headers.get('Content-Length')) > MAX_BODY) throw new RangeError('body-too-large');
  if (!request.body) return '';
  const reader = request.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let bytes = 0;
  let text = '';
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > MAX_BODY) {
        await reader.cancel();
        throw new RangeError('body-too-large');
      }
      text += decoder.decode(chunk.value, { stream: true });
    }
    return text + decoder.decode();
  } finally {
    reader.releaseLock();
  }
}

/** Dependency injection is used only by local tests; production uses global fetch. */
export async function handleContact(request: Request, env: Env, verifyFetch: typeof fetch = fetch): Promise<Response> {
  if (request.method !== 'POST') return reply(request, 405, 'Método no permitido.', { Allow: 'POST' });
  const url = new URL(request.url);
  const origins = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const origin = request.headers.get('Origin');
  if (!origin || origin !== url.origin || !origins.includes(origin))
    return reply(request, 403, 'Origen no autorizado.');
  if (request.headers.get('Sec-Fetch-Site') === 'cross-site') return reply(request, 403, 'Origen no autorizado.');
  if (
    env.CONTACT_ENABLED !== 'true' ||
    !env.TURNSTILE_SECRET_KEY ||
    !env.EMAIL ||
    !env.CONTACT_RATE_LIMITER ||
    !validEmail(env.CONTACT_FROM || '') ||
    !validEmail(env.CONTACT_TO || '')
  ) {
    return reply(request, 503, 'El formulario no está disponible. Escríbenos a info@lcatechnologysolutions.com.');
  }
  const localTest = env.ENVIRONMENT === 'development' && ['localhost', '127.0.0.1'].includes(url.hostname);
  if (!localTest && /^[123]x0000000000000000000000000000000A[AB]$/.test(env.TURNSTILE_SECRET_KEY)) {
    return reply(request, 503, 'El formulario no está disponible. Escríbenos por email.');
  }
  try {
    const ip = request.headers.get('CF-Connecting-IP');
    if (!ip && !localTest) return reply(request, 403, 'No se puede validar el origen de la solicitud.');
    // Per-location rate limits complement Turnstile; they are not a global quota.
    const limited = await env.CONTACT_RATE_LIMITER.limit({ key: `contact:${ip || 'local'}` });
    if (!limited.success)
      return reply(request, 429, 'Has enviado varias solicitudes. Espera un minuto e inténtalo de nuevo.', {
        'Retry-After': '60',
      });
    if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/x-www-form-urlencoded')
      return reply(request, 415, 'Formato no admitido.');
    let body: string;
    try {
      body = await boundedBody(request);
    } catch (error) {
      return reply(
        request,
        error instanceof RangeError ? 413 : 400,
        'La solicitud no es válida o supera el tamaño permitido.'
      );
    }
    const fields = new URLSearchParams(body);
    const allowed = new Set([
      'name',
      'company',
      'email',
      'service',
      'message',
      'privacy',
      'website',
      'cf-turnstile-response',
    ]);
    for (const key of fields.keys()) {
      if (!allowed.has(key) || fields.getAll(key).length !== 1)
        return reply(request, 400, 'Revisa los campos del formulario.');
    }
    const read = (key: string) => (fields.get(key) || '').trim();
    const name = read('name');
    const company = read('company');
    const email = read('email');
    const service = read('service');
    const message = read('message');
    const token = read('cf-turnstile-response');
    const label = Object.hasOwn(serviceNames, service) ? serviceNames[service] : undefined;
    if (read('website')) return reply(request, 400, 'No se ha podido validar la consulta.');
    if (
      name.length < 2 ||
      name.length > 80 ||
      hasControl(name) ||
      company.length > 120 ||
      hasControl(company) ||
      !validEmail(email) ||
      !label ||
      message.length < 20 ||
      message.length > 3000 ||
      message.includes('\u0000') ||
      read('privacy') !== 'accepted' ||
      token.length < 1 ||
      token.length > 2048
    ) {
      return reply(request, 400, 'Revisa nombre, email, servicio, mensaje y lectura de la política de privacidad.');
    }
    const verify = await verifyFetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: env.TURNSTILE_SECRET_KEY,
        response: token,
        ...(ip ? { remoteip: ip } : {}),
        idempotency_key: crypto.randomUUID(),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!verify.ok) return reply(request, 503, 'No se ha podido comprobar la verificación. Inténtalo de nuevo.');
    const result = (await verify.json()) as { success?: boolean; hostname?: string; action?: string };
    const hostnameMatches = result.hostname === url.hostname || (localTest && result.hostname === 'dummy-key-pass');
    if (
      result.success !== true ||
      !hostnameMatches ||
      (result.action !== 'contact' && !(localTest && result.action === 'test'))
    ) {
      return reply(request, 400, 'La verificación de seguridad ha caducado o no es válida. Vuelve a intentarlo.');
    }
    const reference = crypto.randomUUID();
    // The visitor can set Reply-To only. From and To are controlled by the operator.
    // Plain text avoids HTML injection; the subject uses an allowlisted service label.
    await env.EMAIL.send({
      to: env.CONTACT_TO,
      from: env.CONTACT_FROM,
      replyTo: email,
      subject: `Consulta web LCA: ${label}`,
      text: [
        'Nueva consulta desde la web LCA',
        '',
        `Nombre: ${name}`,
        `Empresa: ${company || 'No indicada'}`,
        `Email: ${email}`,
        `Servicio: ${label}`,
        '',
        'Mensaje:',
        message,
        '',
        `Referencia: ${reference}`,
        `Fecha UTC: ${new Date().toISOString()}`,
        'Política de privacidad: leída. Versión 2026-09-27.',
        'Finalidad: atender esta consulta. Sin alta en comunicaciones comerciales.',
      ].join('\n'),
    });
    return reply(request, 200, 'Consulta enviada. Revisaremos tu mensaje y te contactaremos por email.');
  } catch {
    // Do not log the message, email, token, IP or provider exception contents.
    return reply(request, 503, 'No hemos podido confirmar el envío. Inténtalo más tarde o escríbenos por email.');
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const pathname = new URL(request.url).pathname;
    if (pathname === '/api/contact') return handleContact(request, env);
    if (pathname.startsWith('/api/'))
      return Response.json({ ok: false, message: 'Ruta no encontrada.' }, { status: 404, headers: noCacheHeaders });
    return env.ASSETS.fetch(request);
  },
};
