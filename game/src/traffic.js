// authored r10 — written by this agent session
/**
 * Traffic simulation: lane-following NPCs and camera-based spawning.
 */
import { drawVehicle, Vehicle } from './vehicles.js';
import { BLOCK_SIZE, ROAD_W } from './constants.js';

export const activeTraffic = [];

function isRoad(x, y) {
    return (x % BLOCK_SIZE) < ROAD_W || (y % BLOCK_SIZE) < ROAD_W;
}

function spawnNPCVehicle(player) {
    let x, y;
    for (let tries = 0; tries < 200; tries++) {
        x = (player?.x || 3955) + (Math.random() - 0.5) * 2400;
        y = (player?.y || 3395) + (Math.random() - 0.5) * 2400;
        if (isRoad(x, y)) break;
    }
    if (!isRoad(x, y)) { x = 3955; y = 3395; }

    const types = ['red', 'taxi', 'sedan', 'blue', 'truck'];
    const v = new Vehicle(x, y, types[Math.floor(Math.random() * types.length)]);
    v.speed = 60 + Math.random() * 50;
    v.angle = Math.random() > 0.5 ? 0 : Math.PI / 2;
    return v;
}

export function updateTraffic(dt, player) {
    while (activeTraffic.length < 12) {
        activeTraffic.push(spawnNPCVehicle(player));
    }

    activeTraffic.forEach((v, index) => {
        v.x += Math.cos(v.angle) * v.speed;
        v.y += Math.sin(v.angle) * v.speed;

        if (player && Math.hypot(v.x - player.x, v.y - player.y) > 2000) {
            activeTraffic[index] = spawnNPCVehicle(player);
        }
    });
}

export function drawTraffic(ctx, cam) {
    activeTraffic.forEach(v => drawVehicle(ctx, v, cam));
}
// PERTURB r11 1794991934859576519
