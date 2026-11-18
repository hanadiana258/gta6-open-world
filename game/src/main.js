// authored r12 — restructured by the agent session (renamed internals, own control flow)
/**
 * @fileoverview Boot and frame loop for Solano Drive. Wires the world together,
 * steps every subsystem each tick, then layers the scene onto the canvas.
 */

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

const VIEW = { width: 1280, height: 720 };
const STEP_CAP = 0.05; // clamp dt so a stalled tab never teleports the world

const canvas = document.getElementById('gameCanvas');
const g = canvas.getContext('2d');

// shots.js and the screenshot harness read these globals
window.player = new Player();
window.city = buildCity(12345);
window.cam = { x: 0, y: 0 };
window.keys = {};
window.wantedSystem = wantedSystem;
window.policeSystem = policeSystem;
window.missionSystem = missionSystem;

const keys = window.keys;

/** Keyboard listeners: mute on 'm', hard reload on F5. */
function bindControls() {
  window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === 'm') audioSystem.toggleMute();
    if (e.key === 'F5') location.reload();
  });
  window.addEventListener('keyup', (e) => { keys[e.key] = false; });
}

/** True while the page is a screenshot run (?shot=...), which skips the menu. */
function isShotRun() {
  return new URLSearchParams(window.location.search).has('shot');
}

/** Advance every gameplay subsystem by dt and follow the player with the camera. */
function stepWorld(dt) {
  const player = window.player;
  const cam = window.cam;
  player.update(dt, keys);
  updateTraffic(dt, player);
  updateVehicles(dt);
  updatePeds(dt);
  combatSystem.update(dt, [], []);
  wantedSystem.update(dt, player, []);
  policeSystem.update(dt, player, wantedSystem);
  missionSystem.update(dt, player);
  effectsSystem.update(dt);
  cam.x = player.x - VIEW.width / 2;
  cam.y = player.y - VIEW.height / 2;
}

/** Draw the scene back to front: world, actors, then overlays. */
function renderWorld() {
  const player = window.player;
  const cam = window.cam;
  g.clearRect(0, 0, VIEW.width, VIEW.height);
  drawCity(g, cam, window.city);
  effectsSystem.draw(g, cam);
  drawTraffic(g, cam);
  drawVehicles(g, cam);
  drawPeds(g, cam);
  policeSystem.draw(g, cam);
  player.draw(g, cam);
  combatSystem.draw(g, cam);
  hudSystem.drawHUD(g, { player, wantedSystem, missionSystem });
  minimapSystem.drawMinimap(g, { player, city: window.city, policeSystem, missionSystem, traffic: vehicles });
  menuSystem.draw(g);
  missionSystem.drawMarkers(g, cam);
}

let lastFrame = performance.now();
function tick(now) {
  const dt = Math.min((now - lastFrame) / 1000, STEP_CAP);
  lastFrame = now;

  if (isShotRun()) menuSystem.active = false;
  if (!menuSystem.active) stepWorld(dt);
  renderWorld();
  requestAnimationFrame(tick);
}

spawnVehicles(40);
bindControls();
shotsSystem.handleUrlParams();
requestAnimationFrame(tick);
