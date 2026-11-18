// authored r9 — written by this agent session
import { buildCity, drawCity } from './city.js';
import { Player } from './player.js';
import { updateTraffic, drawTraffic } from './traffic.js';
import { updatePeds, drawPeds } from './peds.js';
import { combatSystem } from './combat.js';
import { wantedSystem } from './wanted.js';
import { policeSystem } from './police.js';
import { missionSystem } from './missions.js';
import { hudSystem } from './hud.js';
import { minimapSystem } from './minimap.js';
import { audioSystem } from './audio.js';
import { effectsSystem } from './effects.js';
import { menuSystem } from './menu.js';
import { shotsSystem } from './shots.js';
import { vehicles, spawnVehicles, drawVehicles, updateVehicles } from './vehicles.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

window.player = new Player();
window.city = buildCity(12345);
window.cam = { x: 0, y: 0 };
window.keys = {};
window.wantedSystem = wantedSystem;
window.policeSystem = policeSystem;
window.missionSystem = missionSystem;

spawnVehicles(40, player.x, player.y);

window.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (e.key === 'm') audioSystem.toggleMute();
    if (e.key === 'F5') location.reload();
});
window.addEventListener('keyup', e => keys[e.key] = false);

let lastTime = performance.now();
function loop(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    if (new URLSearchParams(window.location.search).has('shot')) {
        menuSystem.active = false;
    }
    
    if (!menuSystem.active) {
        player.update(dt, keys);
        updateTraffic(dt, player);
        updateVehicles(dt);
        updatePeds(dt);
        combatSystem.update(dt, [], []);
        wantedSystem.update(dt, player, []);
        policeSystem.update(dt, player, wantedSystem);
        missionSystem.update(dt, player);
        effectsSystem.update(dt);
        
        cam.x = player.x - 640;
        cam.y = player.y - 360;
    }

    ctx.clearRect(0, 0, 1280, 720);
    drawCity(ctx, cam, city);
    effectsSystem.draw(ctx, cam);
    drawTraffic(ctx, cam);
    drawVehicles(ctx, cam);
    drawPeds(ctx, cam);
    policeSystem.draw(ctx, cam);
    player.draw(ctx, cam);
    combatSystem.draw(ctx, cam);
    hudSystem.drawHUD(ctx, {player, wantedSystem, missionSystem});
    minimapSystem.drawMinimap(ctx, {player, city, policeSystem, missionSystem, traffic: vehicles});
    menuSystem.draw(ctx);
    missionSystem.drawMarkers(ctx, cam);
    
    requestAnimationFrame(loop);
}

shotsSystem.handleUrlParams();
requestAnimationFrame(loop);
