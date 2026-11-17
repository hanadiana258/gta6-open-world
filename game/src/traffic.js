import { drawVehicle, Vehicle } from './vehicles.js';
import { BLOCK_SIZE, ROAD_W } from './constants.js';

export const activeTraffic = [];

function isRoad(x, y) {
    return (x % BLOCK_SIZE) < ROAD_W || (y % BLOCK_SIZE) < ROAD_W;
}

export function updateTraffic(dt, player) {
    // 1. Keep NPC count
    while (activeTraffic.length < 12) {
        activeTraffic.push(spawnNPCVehicle(player));
    }

    // 2. Drive logic
    activeTraffic.forEach((v, index) => {
        v.x += Math.cos(v.angle) * v.speed;
        v.y += Math.sin(v.angle) * v.speed;

        // Respawn if too far away
        const dist = Math.hypot(v.x - player.x, v.y - player.y);
        if (dist > 2000) {
            activeTraffic[index] = spawnNPCVehicle(player);
        }
    });
}

function spawnNPCVehicle(player) {
    let x, y;
    for (let tries = 0; tries < 200; tries++) {
        x = (player && isFinite(player.x) ? player.x : 3955) + (Math.random() - 0.5) * 2400;
        y = (player && isFinite(player.y) ? player.y : 3395) + (Math.random() - 0.5) * 2400;
        if (isRoad(x, y)) break;
    }
    if (!isRoad(x, y)) { x = 3955; y = 3395; }

    const types = ['red', 'taxi', 'sedan', 'blue', 'truck'];
    const v = new Vehicle(x, y, types[Math.floor(Math.random() * types.length)]);
    v.speed = 60 + Math.random() * 50; // 60-110 px/s
    v.angle = Math.random() > 0.5 ? 0 : Math.PI / 2;
    return v;
}

export function drawTraffic(ctx, cam) {
    activeTraffic.forEach(v => {
        drawVehicle(ctx, v, cam);
    });
}
