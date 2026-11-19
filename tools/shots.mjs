// Builds the "Solano Drive" screenshot sheet: serves game/ on an ephemeral port,
// drives headless Chrome over raw CDP, waits for __solanoReady, saves 1280x720 JPEGs.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const OUT_DIR = path.join(process.cwd(), 'screenshots');
const CHROME = process.env.CHROME_PATH
  || '/root/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell';
const CALL_TIMEOUT = 15000;
const VIEWPORT = { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false };
const SHOT_NAMES = ['city', 'drive', 'chase', 'mission'];
const READY_POLL_MS = 500;
const READY_POLLS = 60;
const MIN_SHOT_BYTES = 10000;
const JPEG_QUALITY = 80;
const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
};

/** Promise that rejects after ms with a label, used to race every CDP call. */
function deadline(ms, label) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout: ${label}`)), ms));
}

/** Tiny static file server rooted at game/; resolves once listening. */
function serveGame() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const rel = req.url === '/' ? 'index.html' : req.url.split('?')[0];
      const file = path.join(process.cwd(), 'game', rel);
      if (fs.existsSync(file) && fs.statSync(file).isFile()) {
        res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'text/plain' });
        res.end(fs.readFileSync(file));
      } else {
        res.writeHead(404);
        res.end();
      }
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

/** Spawn headless Chrome; resolves with the process and its DevTools ws endpoint. */
function launchChrome() {
  const proc = spawn(CHROME, ['--headless', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=0', 'about:blank']);
  return new Promise((resolve, reject) => {
    proc.stderr.on('data', (chunk) => {
      const hit = chunk.toString().match(/DevTools listening on (ws:\/\/\S+)/);
      if (hit) resolve({ proc, wsUrl: hit[1] });
    });
    proc.on('error', reject);
  });
}

/** Minimal CDP client: one websocket, id-matched pending calls, optional sessionId. */
class DevTools {
  constructor(wsUrl) {
    this.nextId = 1;
    this.inFlight = new Map();
    this.ws = new WebSocket(wsUrl);
    this.opened = new Promise((resolve, reject) => {
      this.ws.onopen = () => resolve();
      this.ws.onerror = () => reject(new Error('DevTools websocket failed'));
    });
    this.ws.onmessage = (event) => {
      const envelope = JSON.parse(event.data);
      const msg = envelope.method === 'Target.receivedMessageFromTarget'
        ? JSON.parse(envelope.params.message)
        : envelope;
      if (msg.id && this.inFlight.has(msg.id)) {
        this.inFlight.get(msg.id)(msg.result ?? msg);
        this.inFlight.delete(msg.id);
      }
    };
  }

  async call(method, params = {}, sessionId = null) {
    const id = this.nextId++;
    const wire = sessionId ? { id, method, params, sessionId } : { id, method, params };
    await this.opened;
    return Promise.race([
      deadline(CALL_TIMEOUT, method),
      new Promise((resolve) => {
        this.inFlight.set(id, resolve);
        this.ws.send(JSON.stringify(wire));
      }),
    ]);
  }
}

/** Attach to a fresh page target with Page and Runtime domains enabled. */
async function openPage(cdp) {
  const { targetId } = await cdp.call('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.call('Target.attachToTarget', { targetId, flatten: true });
  await cdp.call('Page.enable', {}, sessionId);
  await cdp.call('Runtime.enable', {}, sessionId);
  await cdp.call('Emulation.setDeviceMetricsOverride', VIEWPORT, sessionId);
  return sessionId;
}

/** Navigate and block until the page sets window.__solanoReady. */
async function waitForReady(cdp, sessionId, url) {
  await cdp.call('Page.navigate', { url }, sessionId);
  for (let poll = 0; poll < READY_POLLS; poll++) {
    const res = await cdp.call('Runtime.evaluate', { expression: 'window.__solanoReady' }, sessionId);
    if (res?.result?.value === true) return;
    await new Promise((r) => setTimeout(r, READY_POLL_MS));
  }
  throw new Error(`Timeout waiting for ${url}`);
}

/** Capture one JPEG shot to disk, refusing suspiciously small files. */
async function grabShot(cdp, sessionId, port, index, name) {
  await waitForReady(cdp, sessionId, `http://127.0.0.1:${port}/index.html?shot=${name}`);
  const { data } = await cdp.call('Page.captureScreenshot', { format: 'jpeg', quality: JPEG_QUALITY }, sessionId);
  const file = path.join(OUT_DIR, `${index + 1}-${name}.jpg`);
  fs.writeFileSync(file, Buffer.from(data, 'base64'));
  if (fs.statSync(file).size < MIN_SHOT_BYTES) throw new Error(`Screenshot ${name} too small`);
  console.log(`Saved ${file}`);
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);
  const server = await serveGame();
  const port = server.address().port;
  const { proc: chrome, wsUrl } = await launchChrome();
  const cdp = new DevTools(wsUrl);
  try {
    const sessionId = await openPage(cdp);
    for (const [index, name] of SHOT_NAMES.entries()) {
      await grabShot(cdp, sessionId, port, index, name);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    chrome.kill();
    server.close();
  }
}

main();
