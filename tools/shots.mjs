import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
// Node 22 global WebSocket (stdlib only)

const shotsDir = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(shotsDir)) fs.mkdirSync(shotsDir);

const TIMEOUT = 15000;

function timeoutPromise(ms, label) {
    return new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout: ${label}`)), ms));
}

const server = http.createServer((req, res) => {
    let filePath = path.join(process.cwd(), 'game', req.url === '/' ? 'index.html' : req.url.split('?')[0]);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        const types = { '.html': 'text/html', '.js': 'application/javascript', '.mjs': 'application/javascript', '.css': 'text/css' };
        res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
        res.end(fs.readFileSync(filePath));
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(0, '127.0.0.1', async () => {
    const port = server.address().port;
    console.log(`Server listening on ${port}`);

    // Adjust path to actual available chrome executable or use a standard one.
    // The previous code had a specific path, let's assume it works or we need to find it.
    const chromePath = process.env.CHROME_PATH || '/root/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell';
    const chrome = spawn(chromePath, [
        '--headless', '--no-sandbox', '--disable-gpu', '--remote-debugging-port=0', 'about:blank'
    ]);

    let wsUrl = '';
    await new Promise((resolve, reject) => {
        chrome.stderr.on('data', (data) => {
            const str = data.toString();
            const match = str.match(/DevTools listening on (ws:\/\/\S+)/);
            if (match) {
                wsUrl = match[1];
                resolve();
            }
        });
        chrome.on('error', (err) => reject(err));
    });
    console.log(`WS URL: ${wsUrl}`);

    const ws = new WebSocket(wsUrl);
    ws.addEventListener('error', e => { console.error('WS Error:', e); process.exit(1); });
    ws.addEventListener('close', () => { console.error('WS Closed'); process.exit(1); });

    const pendingRequests = new Map();
    let requestId = 1;

    ws.addEventListener('message', (event) => {
        const data = JSON.parse(event.data.toString());
        
        // Handle session messages
        let inner = data;
        if (data.method === 'Target.receivedMessageFromTarget' && data.params && data.params.message) {
            inner = JSON.parse(data.params.message);
        }
        if (inner && inner.id && pendingRequests.has(inner.id)) {
            pendingRequests.get(inner.id)(inner.result ?? inner);
            pendingRequests.delete(inner.id);
        }
    });

    const call = (method, params, sessionId = null) => {
        const id = requestId++;
        return Promise.race([
            timeoutPromise(TIMEOUT, method),
            new Promise((resolve, reject) => {
                pendingRequests.set(id, resolve);
                const msg = sessionId ? { id, method, params, sessionId } : { id, method, params };
                ws.send(JSON.stringify(msg));
            })
        ]);
    };

    ws.addEventListener('open', async () => {
        try {
            const { targetId } = await call('Target.createTarget', { url: 'about:blank' });
            const { sessionId } = await call('Target.attachToTarget', { targetId, flatten: true });

            await call('Page.enable', {}, sessionId);
            await call('Runtime.enable', {}, sessionId);
            // Need to set device metrics BEFORE navigation.
            await call('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false }, sessionId);

            const shots = ['city', 'drive', 'chase', 'mission'];
            for (let i = 0; i < shots.length; i++) {
                const shot = shots[i];
                console.log(`Taking screenshot: ${shot}`);
                
                await call('Page.navigate', { url: `http://127.0.0.1:${port}/index.html?shot=${shot}` }, sessionId);
                
                let ready = false;
                const start = Date.now();
                while (!ready && Date.now() - start < 30000) {
                    const res = await call('Runtime.evaluate', { expression: 'window.__solanoReady' }, sessionId);
                    if (res && res.result && res.result.value === true) {
                        ready = true;
                    } else {
                        await new Promise(r => setTimeout(r, 500));
                    }
                }

                if (!ready) {
                    console.error(`Timeout waiting for ${shot}`);
                    const err = await call('Runtime.evaluate', { expression: 'console.error(window.errors); document.body.innerHTML.slice(0,500)' }, sessionId);
                    console.error('Debug info:', err);
                    process.exit(1);
                }
                
                const { data } = await call('Page.captureScreenshot', { format: 'jpeg', quality: 80 }, sessionId);
                const outputPath = path.join(shotsDir, `${i + 1}-${shot}.jpg`);
                fs.writeFileSync(outputPath, Buffer.from(data, 'base64'));
                
                const stats = fs.statSync(outputPath);
                if (stats.size < 10000) {
                    throw new Error(`Screenshot ${shot} is too small: ${stats.size} bytes`);
                }
                console.log(`Saved ${shot} size: ${stats.size}`);
            }
            console.log('All screenshots taken.');
            process.exit(0);
        } catch (e) {
            console.error('Execution Error:', e);
            process.exit(1);
        }
    });
});
