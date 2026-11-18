// rebuilt r8 — authored in this session
/**
 * City layout, district generation, and map rendering module.
 */
import { GRID_SIZE, BLOCK_SIZE, ROAD_W, DISTRICTS } from './constants.js';

export let buildings = [];

export function districtAt(x, y) {
    const gridX = Math.floor(x / BLOCK_SIZE);
    if (gridX < 7) return DISTRICTS.BEACH;
    if (gridX < 14) return DISTRICTS.DOWNTOWN;
    return DISTRICTS.SUBURBS;
}

export function isRoad(x, y) {
    return (x % BLOCK_SIZE) < ROAD_W || (y % BLOCK_SIZE) < ROAD_W;
}

export function buildCity(seed) {
    buildings = [];
    for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 20; j++) {
            if (!isRoad(i * BLOCK_SIZE + ROAD_W, j * BLOCK_SIZE + ROAD_W)) {
                const district = districtAt(i * BLOCK_SIZE + ROAD_W, j * BLOCK_SIZE + ROAD_W);
                const x = i * BLOCK_SIZE + ROAD_W;
                const y = j * BLOCK_SIZE + ROAD_W;
                buildings.push({ x, y, w: BLOCK_SIZE - ROAD_W, h: BLOCK_SIZE - ROAD_W, district });
            }
        }
    }
    return { seed, buildings };
}

export function drawCity(ctx, cam, city) {
    const { x: camX, y: camY, w: camW = 1280, h: camH = 720 } = cam;
    ctx.save();
    ctx.translate(-camX, -camY);

    const startKx = Math.max(0, Math.floor(camX / BLOCK_SIZE) - 1);
    const endKx = Math.min(20, Math.ceil((camX + camW) / BLOCK_SIZE) + 1);
    const startKy = Math.max(0, Math.floor(camY / BLOCK_SIZE) - 1);
    const endKy = Math.min(20, Math.ceil((camY + camH) / BLOCK_SIZE) + 1);

    const drawBase = () => {
        for (let i = startKx; i < endKx; i++) {
            for (let j = startKy; j < endKy; j++) {
                if (!isRoad(i * BLOCK_SIZE + ROAD_W, j * BLOCK_SIZE + ROAD_W)) {
                    const district = districtAt(i * BLOCK_SIZE + ROAD_W, j * BLOCK_SIZE + ROAD_W);
                    ctx.fillStyle = district === DISTRICTS.SUBURBS ? '#7cb342' :
                                   district === DISTRICTS.BEACH ? '#e8d8a0' : '#b8b8b0';
                    ctx.fillRect(i * BLOCK_SIZE + ROAD_W, j * BLOCK_SIZE + ROAD_W, BLOCK_SIZE - ROAD_W, BLOCK_SIZE - ROAD_W);
                }
            }
        }
    };

    const drawRoads = () => {
        ctx.fillStyle = '#3a3f44';
        for (let k = 0; k < 20; k++) {
            ctx.fillRect(k * BLOCK_SIZE, 0, ROAD_W, 20 * BLOCK_SIZE);
            ctx.fillRect(0, k * BLOCK_SIZE, 20 * BLOCK_SIZE, ROAD_W);
        }
        
        ctx.strokeStyle = "#d0d0d0";
        ctx.lineWidth = 4;
        for (let k = 0; k < 20; k++) {
            ctx.strokeRect(k * BLOCK_SIZE, 0, 0, 20 * BLOCK_SIZE);
            ctx.strokeRect(k * BLOCK_SIZE + ROAD_W, 0, 0, 20 * BLOCK_SIZE);
            ctx.strokeRect(0, k * BLOCK_SIZE, 20 * BLOCK_SIZE, 0);
            ctx.strokeRect(0, k * BLOCK_SIZE + ROAD_W, 20 * BLOCK_SIZE, 0);
        }
        
        ctx.strokeStyle = "#ffd76e";
        ctx.setLineDash([18, 14]);
        for (let k = 0; k < 20; k++) {
            ctx.beginPath();
            ctx.moveTo(k * BLOCK_SIZE + ROAD_W / 2, 0);
            ctx.lineTo(k * BLOCK_SIZE + ROAD_W / 2, 20 * BLOCK_SIZE);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, k * BLOCK_SIZE + ROAD_W / 2);
            ctx.lineTo(20 * BLOCK_SIZE, k * BLOCK_SIZE + ROAD_W / 2);
            ctx.stroke();
        }
        ctx.setLineDash([]);
    };

    const drawSidewalks = () => {
        ctx.fillStyle = "#cfcfc8";
        for (let i = startKx; i < endKx; i++) {
            for (let j = startKy; j < endKy; j++) {
                if (!isRoad(i * BLOCK_SIZE + ROAD_W, j * BLOCK_SIZE + ROAD_W)) {
                    const baseX = i * BLOCK_SIZE + ROAD_W;
                    const baseY = j * BLOCK_SIZE + ROAD_W;
                    const size = BLOCK_SIZE - ROAD_W;
                    ctx.fillRect(baseX, baseY, 10, size);
                    ctx.fillRect(baseX, baseY, size, 10);
                    ctx.fillRect(i * BLOCK_SIZE + BLOCK_SIZE - 10, baseY, 10, size);
                    ctx.fillRect(baseX, j * BLOCK_SIZE + BLOCK_SIZE - 10, size, 10);
                }
            }
        }
    };

    const drawBuildings = () => {
        city.buildings.forEach(b => {
            if (b.x < camX + camW && b.x + b.w > camX && b.y < camY + camH && b.y + b.h > camY) {
                ctx.shadowColor = 'rgba(0,0,0,0.25)';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 6;
                ctx.shadowOffsetY = 6;
                
                if (b.district === DISTRICTS.DOWNTOWN) {
                    ctx.fillStyle = '#5d7a96';
                    ctx.fillRect(b.x + 12, b.y + 12, b.w - 24, b.h - 24);
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                    for(let r=0; r<4; r++) for(let c=0; c<6; c++) {
                        ctx.fillStyle = Math.random() > 0.5 ? '#ffd76e' : '#d7ecf7';
                        ctx.fillRect(b.x + 20 + c * 30, b.y + 20 + r * 40, 15, 25);
                    }
                } else if (b.district === DISTRICTS.SUBURBS) {
                    ctx.fillStyle = '#d9c9a3';
                    ctx.fillRect(b.x + 12, b.y + 12, b.w - 24, b.h - 24);
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                    ctx.fillStyle = '#c0392b';
                    ctx.beginPath();
                    ctx.moveTo(b.x + 12, b.y + 12);
                    ctx.lineTo(b.x + b.w/2, b.y - 10);
                    ctx.lineTo(b.x + b.w - 12, b.y + 12);
                    ctx.fill();
                } else {
                    ctx.fillStyle = '#f2b0a0';
                    ctx.fillRect(b.x + 12, b.y + 12, b.w - 24, b.h - 24);
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                }
                ctx.shadowColor = 'transparent';
            }
        });
    };

    const drawWater = () => {
        ctx.fillStyle = "#2f7fbf";
        ctx.fillRect(0, 0, ROAD_W, 20 * BLOCK_SIZE);
        ctx.fillStyle = "#8b4513";
        ctx.fillRect(240, 3500, 60, 200);
    };

    drawBase();
    drawRoads();
    drawSidewalks();
    drawBuildings();
    drawWater();
    ctx.restore();
}
