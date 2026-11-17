/**
 * @fileoverview Minimap rendering system for Solano Drive,
 * visualizing the game world and entities.
 */

import { BLOCK_SIZE } from './constants.js';

export const MinimapManager = {
    drawMinimap(ctx, { player, policeSystem, missionManager, traffic }) {
        const size = 180;
        const xOffset = 14;
        const yOffset = 720 - 194;
        
        // Background and border
        ctx.fillStyle = '#101010';
        ctx.fillRect(xOffset, yOffset, size, size);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(xOffset, yOffset, size, size);
        
        ctx.save();
        ctx.beginPath();
        ctx.rect(xOffset, yOffset, size, size);
        ctx.clip();

        const scale = size / 5600;
        
        // District representations
        ctx.fillStyle = 'rgba(217, 197, 138, 0.3)';
        ctx.fillRect(xOffset, yOffset, 7 * BLOCK_SIZE * scale, size);
        ctx.fillStyle = 'rgba(128, 149, 168, 0.3)';
        ctx.fillRect(xOffset + 7 * BLOCK_SIZE * scale, yOffset, 7 * BLOCK_SIZE * scale, size);
        ctx.fillStyle = 'rgba(124, 179, 66, 0.3)';
        ctx.fillRect(xOffset + 14 * BLOCK_SIZE * scale, yOffset, 6 * BLOCK_SIZE * scale, size);

        // Road network
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 3;
        for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.moveTo(xOffset + i * BLOCK_SIZE * scale, yOffset);
            ctx.lineTo(xOffset + i * BLOCK_SIZE * scale, yOffset + size);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(xOffset, yOffset + i * BLOCK_SIZE * scale);
            ctx.lineTo(xOffset + size, yOffset + i * BLOCK_SIZE * scale);
            ctx.stroke();
        }

        // Render traffic
        ctx.fillStyle = 'white';
        traffic.forEach(vehicle => {
            ctx.fillRect(xOffset + vehicle.x * scale - 1, yOffset + vehicle.y * scale - 1, 2, 2);
        });

        // Render police
        ctx.fillStyle = 'red';
        policeSystem.units.forEach(unit => {
            ctx.fillRect(xOffset + unit.x * scale - 2, yOffset + unit.y * scale - 2, 4, 4);
        });

        // Render mission target
        if (missionManager.active) {
            const currentMission = missionManager.missions[missionManager.currentMissionIndex];
            ctx.fillStyle = 'yellow';
            ctx.beginPath();
            ctx.arc(xOffset + currentMission.target.x * scale, yOffset + currentMission.target.y * scale, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Render player
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(xOffset + player.x * scale, yOffset + player.y * scale - 6);
        ctx.lineTo(xOffset + player.x * scale - 4, yOffset + player.y * scale + 4);
        ctx.lineTo(xOffset + player.x * scale + 4, yOffset + player.y * scale + 4);
        ctx.fill();

        ctx.restore();
    }
};
