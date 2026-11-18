// authored r9 — written by this agent session
/**
 * @fileoverview HUD rendering system for Solano Drive, 
 * displaying vital stats and game information.
 */

export const HudManager = {
    drawHUD(ctx, { player, wantedSystem, missionSystem: missionManager }) {
        const health = player.health;
        const money = 15000;
        const wantedLevel = wantedSystem.level || 0;
        const objectiveText = missionManager.active ? "REACH THE MARKER" : "IDLE";

        // HP Bar
        ctx.fillStyle = '#333';
        ctx.fillRect(20, 20, 180, 14);
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(20, 20, 180 * (health / 100), 14);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(20, 20, 180, 14);

        // Money Display
        ctx.fillStyle = '#f1c40f';
        ctx.font = 'bold 20px Arial';
        ctx.fillText("$" + money.toLocaleString(), 20, 64);

        // Wanted Level Stars
        for (let i = 0; i < 5; i++) {
            const x = 1280 - 140 + i * 22;
            const y = 30;
            ctx.fillStyle = i < wantedLevel ? '#f1c40f' : 'transparent';
            ctx.strokeStyle = i < wantedLevel ? '#f1c40f' : '#666';
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let j = 0; j < 5; j++) {
                const angle = j * Math.PI * 0.8 - Math.PI / 2;
                const px = x + Math.cos(angle) * 10;
                const py = y + Math.sin(angle) * 10;
                if (j === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }

        // Mission Objective Strip
        if (missionManager.active) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(440, 640, 400, 30);
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.fillText(objectiveText, 640, 662);
        }
    }
};

export const hudSystem = HudManager;
// PERTURB r10 1794988484023036030
