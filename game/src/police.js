// authored r9 — written by this agent session
/* Solano Drive: Police unit behavior, pursuit AI, and lightbar effects. */
export const policeSystem = {
    units: [],

    spawnUnits(count, x, y) {
        for (let i = 0; i < count; i++) {
            this.units.push({
                x: x - 150 - (Math.random() * 110),
                y: y - 100 + (Math.random() * 200),
                angle: 0,
                speed: 3,
                type: 'police',
                width: 38,
                height: 18,
                color: '#1b1b1b'
            });
        }
    },

    update(dt, player, wanted) {
        if (wanted.level < 1) {
            this.units = [];
            return;
        }
        if (this.units.length < 3) this.spawnUnits(3 - this.units.length, player.x, player.y);

        for (let unit of this.units) {
            const dx = player.x - unit.x;
            const dy = player.y - unit.y;
            unit.angle = Math.atan2(dy, dx);
            unit.x += Math.cos(unit.angle) * unit.speed;
            unit.y += Math.sin(unit.angle) * unit.speed;
        }
    },

    draw(ctx, cam) {
        for (let unit of this.units) {
            ctx.save();
            ctx.translate(unit.x - cam.x, unit.y - cam.y);
            ctx.rotate(unit.angle);
            ctx.fillStyle = '#1b1b1b';
            ctx.fillRect(-19, -9, 38, 18);
            ctx.fillStyle = '#fff';
            ctx.fillRect(-5, -9, 10, 18);
            const isFlashing = (Date.now() % 500) < 250;
            ctx.fillStyle = isFlashing ? '#e74c3c' : '#3498db';
            ctx.fillRect(-4, -6, 8, 3);
            ctx.fillStyle = isFlashing ? '#3498db' : '#e74c3c';
            ctx.fillRect(-4, 3, 8, 3);
            ctx.fillStyle = '#fff9c4';
            ctx.fillRect(15, -6, 4, 4);
            ctx.fillRect(15, 2, 4, 4);
            ctx.restore();
        }
    }
};
// PERTURB r10 1794988484068423999
