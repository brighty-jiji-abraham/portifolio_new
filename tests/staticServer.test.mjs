import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

let directory, child, base;
before(async () => {
  directory = await mkdtemp(join(tmpdir(), 'portfolio-cache-test-'));
  const current = join(directory, 'dist'), previous = join(directory, 'dist-prev');
  await Promise.all([mkdir(join(current, 'assets'), { recursive: true }), mkdir(join(previous, 'assets'), { recursive: true })]);
  await Promise.all([
    writeFile(join(current, 'index.html'), '<h1>Current portfolio</h1>'),
    writeFile(join(current, 'assets', 'current-abc.js'), 'current();'),
    writeFile(join(current, 'site.webmanifest'), '{}'),
    writeFile(join(previous, 'index.html'), '<h1>Previous portfolio</h1>'),
    writeFile(join(previous, 'private.txt'), 'Never expose this'),
    writeFile(join(previous, 'assets', 'previous-abc.js'), 'previous();'),
  ]);
  const probe = createServer().listen(0, '127.0.0.1');
  await once(probe, 'listening');
  const port = probe.address().port;
  await new Promise(resolve => probe.close(resolve));
  base = `http://127.0.0.1:${port}`;
  child = spawn(process.execPath, [fileURLToPath(new URL('../server/serve.mjs', import.meta.url))], {
    env: { ...process.env, HOST: '127.0.0.1', PORT: String(port), DIST_DIR: current, PREVIOUS_DIST_DIR: previous },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Static server startup timed out')), 5000);
    child.once('error', reject);
    child.once('exit', code => { clearTimeout(timeout); reject(new Error(`Server exited: ${code}`)); });
    child.stdout.on('data', data => {
      if (String(data).includes('Serving ')) { clearTimeout(timeout); resolve(); }
    });
  });
});

after(async () => {
  if (child?.exitCode === null) {
    const exit = once(child, 'exit');
    child.kill();
    await exit;
  }
  // Only remove the isolated directory created by this test.
  if (directory && resolve(directory).startsWith(resolve(tmpdir()) + sep)
      && directory.split(sep).at(-1).startsWith('portfolio-cache-test-')) {
    await rm(directory, { recursive: true, force: true });
  }
});

test('public HTML has a short CDN TTL while browser revalidation and immutable assets are retained', async () => {
  const response = await fetch(base);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), '<h1>Current portfolio</h1>');
  assert.equal(response.headers.get('cache-control'), 'no-cache');
  assert.equal(response.headers.get('cloudflare-cdn-cache-control'), 'public, max-age=60');
  const fresh = await fetch(base, { headers: { 'If-None-Match': response.headers.get('etag') } });
  assert.equal(fresh.status, 304);
  assert.equal(fresh.headers.get('cloudflare-cdn-cache-control'), 'public, max-age=60');
  const asset = await fetch(`${base}/assets/current-abc.js`);
  assert.equal(asset.headers.get('cache-control'), 'public, max-age=31536000, immutable');
  assert.equal(asset.headers.get('cloudflare-cdn-cache-control'), null);
  const manifest = await fetch(`${base}/site.webmanifest`);
  assert.equal(manifest.headers.get('cache-control'), 'no-cache');
  assert.equal(manifest.headers.get('cloudflare-cdn-cache-control'), null);
});

test('previous-release fallback serves only assets, including HEAD and ranges', async () => {
  const url = `${base}/assets/previous-abc.js`;
  const asset = await fetch(url);
  assert.equal(asset.status, 200);
  assert.equal(await asset.text(), 'previous();');
  assert.equal(asset.headers.get('cache-control'), 'public, max-age=31536000, immutable');
  const head = await fetch(url, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  const range = await fetch(url, { headers: { Range: 'bytes=0-3' } });
  assert.equal(range.status, 206);
  assert.equal(await range.text(), 'prev');
  for (const path of ['/private.txt', '/assets/missing.js', '/assets/%2f../private.txt']) {
    const missing = await fetch(base + path);
    assert.equal(missing.status, 404, path);
    assert.equal(missing.headers.get('cache-control'), 'no-store');
    assert.equal(missing.headers.get('cloudflare-cdn-cache-control'), null);
  }
  const normalized = await fetch(`${base}/assets/%2f../index.html`);
  assert.equal(await normalized.text(), '<h1>Current portfolio</h1>', 'never use the previous HTML');
  const post = await fetch(base, { method: 'POST' });
  assert.equal(post.status, 405);
  assert.equal(post.headers.get('cache-control'), 'no-store');
});
