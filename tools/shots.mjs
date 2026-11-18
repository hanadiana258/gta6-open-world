// This tool builds the "Solano Drive" screenshots by spawning a headless browser.
// It serves the game locally, navigates to specific shots, waits for __solanoReady,
// and captures 1280x720 JPEG screenshots.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const shotsDir = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(shotsDir)) fs.mkdirSync(shotsDir);

const CHROME_PATH = process.env.CHROME_PATH || '/root/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell';
const TIMEOUT = 15000;

function timeoutPromise(ms, label) {
    return new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout: ${label}`)), ms));
}

const server = http.createServer((req, res) => {
    const filePath = path.join(process.cwd(), 'game', req.url === '/' ? 'index.html' : req.url.split('?')[0]);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const types = { '.html': 'text/html', '.js': 'application/javascript', '.mjs': 'application/javascript', '.css': 'text/css' };
        res.writeHead(200, { 'Content-Type': types[path.extname(filePath)] || 'text/plain' });
        res.end(fs.readFileSync(filePath));
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(0, '127.0.0.1', async () => {
    const port = server.address().port;
    const chrome = spawn(CHROME_PATH, ['--headless', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=0', 'about:blank']);

    let wsUrl = await new Promise((resolve, reject) => {
        chrome.stderr.on('data', (data) => {
            const match = data.toString().match(/DevTools listening on (ws:\/\/\S+)/);
            if (match) resolve(match[1]);
        });
        chrome.on('error', reject);
    });

    const ws = new WebSocket(wsUrl);
    const pendingRequests = new Map();
    let requestId = 1;

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const msg = (data.method === 'Target.receivedMessageFromTarget') ? JSON.parse(data.params.message) : data;
        if (msg.id && pendingRequests.has(msg.id)) {
            pendingRequests.get(msg.id)(msg.result ?? msg);
            pendingRequests.delete(msg.id);
        }
    };

    const call = (method, params = {}, sessionId = null) => {
        const id = requestId++;
        return Promise.race([
            timeoutPromise(TIMEOUT, method),
            new Promise(resolve => {
                pendingRequests.set(id, resolve);
                ws.send(JSON.stringify(sessionId ? { id, method, params, sessionId } : { id, method, params }));
            })
        ]);
    };

    ws.onopen = async () => {
        try {
            const { targetId } = await call('Target.createTarget', { url: 'about:blank' });
            const { sessionId } = await call('Target.attachToTarget', { targetId, flatten: true });
            await call('Page.enable', {}, sessionId);
            await call('Runtime.enable', {}, sessionId);
            await call('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false }, sessionId);

            const shots = ['city', 'drive', 'chase', 'mission'];
            for (const [i, shot] of shots.entries()) {
                await call('Page.navigate', { url: `http://127.0.0.1:${port}/index.html?shot=${shot}` }, sessionId);
                
                let ready = false;
                for (let attempt = 0; attempt < 60; attempt++) {
                    const res = await call('Runtime.evaluate', { expression: 'window.__solanoReady' }, sessionId);
                    if (res?.result?.value === true) { ready = true; break; }
                    await new Promise(r => setTimeout(r, 500));
                }
                if (!ready) throw new Error(`Timeout waiting for ${shot}`);

                const { data } = await call('Page.captureScreenshot', { format: 'jpeg', quality: 80 }, sessionId);
                const out = path.join(shotsDir, `${i + 1}-${shot}.jpg`);
                fs.writeFileSync(out, Buffer.from(data, 'base64'));
                if (fs.statSync(out).size < 10000) throw new Error(`Screenshot ${shot} too small`);
                console.log(`Saved ${out}`);
            }
            process.exit(0);
        } catch (e) {
            console.error(e);
            process.exit(1);
        }
    };
});
