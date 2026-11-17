export class Player {
    constructor() {
        this.x = 14 * 280 + 35;
        this.y = 12 * 280 + 35;
        this.health = 100;
        this.inVehicle = null;
    }

    update(dt, keys) {
        if (this.inVehicle) {
            const v = this.inVehicle;
            const acc = 220, maxSpeed = 320;
            if (keys && (keys['w'] || keys['ArrowUp'])) v.speed = Math.min(maxSpeed, (v.speed || 0) + acc * dt);
            else if (keys && (keys['s'] || keys['ArrowDown'])) v.speed = Math.max(-120, (v.speed || 0) - acc * dt);
            else v.speed = (v.speed || 0) * (1 - 1.2 * dt);
            if (keys && (keys['a'] || keys['ArrowLeft'])) v.angle -= 2.2 * dt;
            if (keys && (keys['d'] || keys['ArrowRight'])) v.angle += 2.2 * dt;
            if (!isFinite(v.x)) v.x = 3955;
            if (!isFinite(v.y)) v.y = 3395;
            v.x += Math.cos(v.angle || 0) * (v.speed || 0) * dt;
            v.y += Math.sin(v.angle || 0) * (v.speed || 0) * dt;
            this.x = v.x; this.y = v.y; this.angle = v.angle || 0;
            return;
        }
        const spd = 150 * dt;
        let dx = 0, dy = 0;
        if (keys && keys['w']) dy -= spd;
        if (keys && keys['s']) dy += spd;
        if (keys && keys['a']) dx -= spd;
        if (keys && keys['d']) dx += spd;
        this.x += dx; this.y += dy;
        if (dx || dy) this.angle = Math.atan2(dy, dx);
    }

    draw(ctx, cam) {
        if (this.inVehicle) {
            ctx.save();
            ctx.fillStyle = this.inVehicle.color || 'red';
            ctx.fillRect(this.x - cam.x - 20, this.y - cam.y - 10, 40, 20);
            ctx.restore();
            return;
        }

        ctx.save();
        ctx.translate(this.x - cam.x, this.y - cam.y);
        
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 5;

        // White Shirt
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(-6, -8, 12, 10);
        
        // Dark Trousers
        ctx.fillStyle = '#333';
        ctx.fillRect(-6, 2, 12, 8);
        
        // Head
        ctx.fillStyle = '#e0ac69';
        ctx.beginPath();
        ctx.arc(0, -12, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Black Cap
        ctx.fillStyle = '#000';
        ctx.fillRect(-6, -18, 12, 4);

        // Thin white outline
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(-6, -8, 12, 18);
        
        ctx.restore();
    }
}
