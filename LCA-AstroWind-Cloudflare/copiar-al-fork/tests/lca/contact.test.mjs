import test from 'node:test';
import assert from 'node:assert/strict';
import worker, { handleContact } from '../../worker/contact.ts';
const origin = 'https://lcatechnologysolutions.com';
const validData = () => ({
  name: 'Persona de prueba',
  company: 'Empresa de prueba',
  email: 'consulta@example.com',
  service: 'ia',
  message: 'Queremos integrar el CRM con nuestro correo corporativo.',
  privacy: 'accepted',
  website: '',
  'cf-turnstile-response': 'valid-test-token',
});
const request = (data = validData(), headers = {}, path = '/api/contact') =>
  new Request(origin + path, {
    method: 'POST',
    headers: {
      Origin: origin,
      'CF-Connecting-IP': '192.0.2.1',
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
      ...headers,
    },
    body: new URLSearchParams(data),
  });
function setup(
  overrides = {},
  verification = { success: true, hostname: 'lcatechnologysolutions.com', action: 'contact' }
) {
  const sent = [];
  let verified = 0;
  const env = {
    CONTACT_ENABLED: 'true',
    ALLOWED_ORIGINS: origin,
    TURNSTILE_SECRET_KEY: 'production-secret-fixture',
    CONTACT_FROM: 'web@forms.lcatechnologysolutions.com',
    CONTACT_TO: 'info@lcatechnologysolutions.com',
    ENVIRONMENT: 'production',
    EMAIL: {
      send: async (message) => {
        sent.push(message);
        return { messageId: 'mock' };
      },
    },
    CONTACT_RATE_LIMITER: { limit: async () => ({ success: true }) },
    ASSETS: { fetch: async () => new Response('asset') },
    ...overrides,
  };
  const verify = async () => {
    verified++;
    return Response.json(verification);
  };
  return { env, sent, verify, verified: () => verified };
}

test('valid message reaches only the configured destination and uses Reply-To', async () => {
  const s = setup();
  const result = await handleContact(request(), s.env, s.verify);
  assert.equal(result.status, 200);
  assert.equal((await result.json()).ok, true);
  assert.equal(s.sent.length, 1);
  assert.equal(s.sent[0].to, s.env.CONTACT_TO);
  assert.equal(s.sent[0].from, s.env.CONTACT_FROM);
  assert.equal(s.sent[0].replyTo, 'consulta@example.com');
  assert.match(s.sent[0].text, /Política de privacidad: leída/);
  assert.equal(result.headers.get('cache-control'), 'no-store');
});
for (const [name, headers] of [
  ['foreign origin', { Origin: 'https://attacker.example' }],
  ['missing origin', { Origin: '' }],
  ['cross-site metadata', { 'Sec-Fetch-Site': 'cross-site' }],
]) {
  test(`rejects ${name}`, async () => {
    const s = setup();
    assert.equal((await handleContact(request(validData(), headers), s.env, s.verify)).status, 403);
    assert.equal(s.sent.length, 0);
    assert.equal(s.verified(), 0);
  });
}
for (const [name, value] of [
  ['name', 'A'],
  ['email', 'person@example.com\r\nBcc: other@example.com'],
  ['company', 'test\nheader'],
  ['message', 'short'],
  ['service', '__proto__'],
  ['privacy', ''],
  ['website', 'https://spam.example'],
  ['cf-turnstile-response', ''],
]) {
  test(`rejects invalid ${name}`, async () => {
    const s = setup();
    assert.equal((await handleContact(request({ ...validData(), [name]: value }), s.env, s.verify)).status, 400);
    assert.equal(s.sent.length, 0);
    assert.equal(s.verified(), 0);
  });
}
test('rejects duplicated and unexpected form fields', async () => {
  const s = setup();
  const params = new URLSearchParams(validData());
  params.append('email', 'other@example.com');
  assert.equal((await handleContact(request(params), s.env, s.verify)).status, 400);
  assert.equal(
    (await handleContact(request({ ...validData(), to: 'other@example.com' }), s.env, s.verify)).status,
    400
  );
});
for (const verification of [
  { success: false },
  { success: true, hostname: 'attacker.example', action: 'contact' },
  { success: true, hostname: 'lcatechnologysolutions.com', action: 'login' },
]) {
  test(`rejects invalid Turnstile result ${JSON.stringify(verification)}`, async () => {
    const s = setup({}, verification);
    assert.equal((await handleContact(request(), s.env, s.verify)).status, 400);
    assert.equal(s.sent.length, 0);
  });
}
test('rejects oversized streamed body even without Content-Length', async () => {
  const s = setup();
  const result = await handleContact(request({ ...validData(), message: 'a'.repeat(20000) }), s.env, s.verify);
  assert.equal(result.status, 413);
  assert.equal(s.verified(), 0);
});
test('rate limited response sends no email', async () => {
  const s = setup({ CONTACT_RATE_LIMITER: { limit: async () => ({ success: false }) } });
  const result = await handleContact(request(), s.env, s.verify);
  assert.equal(result.status, 429);
  assert.equal(result.headers.get('retry-after'), '60');
  assert.equal(s.verified(), 0);
});
test('upstream verification and delivery failures never claim success', async () => {
  const s = setup();
  assert.equal((await handleContact(request(), s.env, async () => new Response('', { status: 502 }))).status, 503);
  assert.equal(
    (
      await handleContact(request(), s.env, async () => {
        throw new Error('timeout');
      })
    ).status,
    503
  );
  const fail = setup({
    EMAIL: {
      send: async () => {
        throw new Error('provider details must not be returned');
      },
    },
  });
  const response = await handleContact(request(), fail.env, fail.verify);
  assert.equal(response.status, 503);
  assert.doesNotMatch(await response.text(), /provider details/);
});
test('form disabled and missing binding fail closed', async () => {
  for (const overrides of [
    { CONTACT_ENABLED: 'false' },
    { CONTACT_RATE_LIMITER: undefined },
    { EMAIL: undefined },
    { TURNSTILE_SECRET_KEY: '' },
  ]) {
    const s = setup(overrides);
    assert.equal((await handleContact(request(), s.env, s.verify)).status, 503);
    assert.equal(s.sent.length, 0);
  }
});
test('public testing secret is rejected outside local development', async () => {
  const s = setup({ TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA' });
  assert.equal((await handleContact(request(), s.env, s.verify)).status, 503);
});
test('method, content type, redirects and routing behave correctly', async () => {
  const s = setup();
  const get = await handleContact(new Request(origin + '/api/contact'), s.env, s.verify);
  assert.equal(get.status, 405);
  assert.equal(get.headers.get('allow'), 'POST');
  assert.equal(
    (await handleContact(request(validData(), { 'Content-Type': 'application/json' }), s.env, s.verify)).status,
    415
  );
  const native = await handleContact(request(validData(), { Accept: 'text/html' }), s.env, s.verify);
  assert.equal(native.status, 303);
  assert.equal(native.headers.get('location'), '/gracias');
  assert.equal((await worker.fetch(new Request(origin + '/api/missing'), s.env)).status, 404);
  assert.equal(await (await worker.fetch(new Request(origin + '/'), s.env)).text(), 'asset');
});
