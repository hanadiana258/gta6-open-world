// rebuilt r5 — authored by this session
/* Solano Drive: Combat mechanics, projectiles, and cooldowns. */
export const combatSystem = {
    bullets: [],
    lastShotTimestamp: 0,

    fire(x, y, targetX, targetY) {
        if (Date.now() - this.lastShotTimestamp < 250) return;
        this.lastShotTimestamp = Date.now();
        const angle = Math.atan2(targetY - y, targetX - x);
        this.bullets.push({ 
            x, y, 
            vx: Math.cos(angle) * 10, 
            vy: Math.sin(angle) * 10, 
            ttl: 20 
        });
    },

    update(dt) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
            bullet.ttl--;
            if (bullet.ttl <= 0) this.bullets.splice(i, 1);
        }
    },

    draw(ctx, cam) {
        ctx.strokeStyle = "yellow";
        for (let bullet of this.bullets) {
            ctx.beginPath();
            ctx.moveTo(bullet.x - cam.x, bullet.y - cam.y);
            ctx.lineTo(bullet.x - cam.x - bullet.vx * 2, bullet.y - cam.y - bullet.vy * 2);
            ctx.stroke();
        }
    }
};
