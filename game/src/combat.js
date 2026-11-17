export const combatSystem = {
    bullets: [],
    lastShot: 0,
    shoot(x, y, tx, ty) {
        if (Date.now() - this.lastShot < 250) return;
        this.lastShot = Date.now();
        const angle = Math.atan2(ty - y, tx - x);
        this.bullets.push({ x, y, vx: Math.cos(angle) * 10, vy: Math.sin(angle) * 10, ttl: 20 });
    },
    update(dt, peds, cops) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.x += b.vx;
            b.y += b.vy;
            b.ttl--;
            if (b.ttl <= 0) this.bullets.splice(i, 1);
        }
    },
    draw(ctx, cam) {
        ctx.strokeStyle = "yellow";
        for (let b of this.bullets) {
            ctx.beginPath();
            ctx.moveTo(b.x - cam.x, b.y - cam.y);
            ctx.lineTo(b.x - cam.x - b.vx * 2, b.y - cam.y - b.vy * 2);
            ctx.stroke();
        }
    }
};
