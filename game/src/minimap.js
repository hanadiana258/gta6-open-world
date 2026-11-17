import { BLOCK_SIZE, ROAD_W } from './constants.js';

export const minimapSystem = {
    drawMinimap(ctx, { player, city, policeSystem, missionSystem, traffic }) {
        const size = 180;
        const x = 14;
        const y = 720 - 194;
        
        ctx.fillStyle = '#101010';
        ctx.fillRect(x, y, size, size);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, size, size);
        
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, size, size);
        ctx.clip();

        const scale = size / 5600;
        
        // Districts
        ctx.fillStyle = 'rgba(217, 197, 138, 0.3)';
        ctx.fillRect(x, y, 7 * BLOCK_SIZE * scale, size);
        ctx.fillStyle = 'rgba(128, 149, 168, 0.3)';
        ctx.fillRect(x + 7 * BLOCK_SIZE * scale, y, 7 * BLOCK_SIZE * scale, size);
        ctx.fillStyle = 'rgba(124, 179, 66, 0.3)';
        ctx.fillRect(x + 14 * BLOCK_SIZE * scale, y, 6 * BLOCK_SIZE * scale, size);

        // Roads
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 3;
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.moveTo(x + i * BLOCK_SIZE * scale, y);
            ctx.lineTo(x + i * BLOCK_SIZE * scale, y + size);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y + i * BLOCK_SIZE * scale);
            ctx.lineTo(x + size, y + i * BLOCK_SIZE * scale);
            ctx.stroke();
        }

        // Traffic
        ctx.fillStyle = 'white';
        traffic.forEach(v => ctx.fillRect(x + v.x * scale - 1, y + v.y * scale - 1, 2, 2));

        // Police
        ctx.fillStyle = 'red';
        policeSystem.units.forEach(u => ctx.fillRect(x + u.x * scale - 2, y + u.y * scale - 2, 4, 4));

        // Mission
        if (missionSystem.active) {
            const m = missionSystem.list[missionSystem.current];
            ctx.fillStyle = 'yellow';
            ctx.beginPath();
            ctx.arc(x + m.target.x * scale, y + m.target.y * scale, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Player
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(x + player.x * scale, y + player.y * scale - 6);
        ctx.lineTo(x + player.x * scale - 4, y + player.y * scale + 4);
        ctx.lineTo(x + player.x * scale + 4, y + player.y * scale + 4);
        ctx.fill();

        ctx.restore();
    }
};
