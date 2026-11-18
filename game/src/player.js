// authored r10 — written by this agent session
/* Solano Drive: Player movement, vehicle handling, and character rendering. */
export class Player {
    constructor() {
        this.x = 14 * 280 + 35;
        this.y = 12 * 280 + 35;
        this.health = 100;
        this.inVehicle = null;
    }

    update(dt, input) {
        if (this.inVehicle) {
            const vehicle = this.inVehicle;
            const acceleration = 220, maxSpeed = 320;
            if (input && (input['w'] || input['ArrowUp'])) vehicle.speed = Math.min(maxSpeed, (vehicle.speed || 0) + acceleration * dt);
            else if (input && (input['s'] || input['ArrowDown'])) vehicle.speed = Math.max(-120, (vehicle.speed || 0) - acceleration * dt);
            else vehicle.speed = (vehicle.speed || 0) * (1 - 1.2 * dt);
            if (input && (input['a'] || input['ArrowLeft'])) vehicle.angle -= 2.2 * dt;
            if (input && (input['d'] || input['ArrowRight'])) vehicle.angle += 2.2 * dt;
            if (!isFinite(vehicle.x)) vehicle.x = 3955;
            if (!isFinite(vehicle.y)) vehicle.y = 3395;
            vehicle.x += Math.cos(vehicle.angle || 0) * (vehicle.speed || 0) * dt;
            vehicle.y += Math.sin(vehicle.angle || 0) * (vehicle.speed || 0) * dt;
            this.x = vehicle.x; this.y = vehicle.y; this.angle = vehicle.angle || 0;
            return;
        }
        const speed = 150 * dt;
        let dx = 0, dy = 0;
        if (input && input['w']) dy -= speed;
        if (input && input['s']) dy += speed;
        if (input && input['a']) dx -= speed;
        if (input && input['d']) dx += speed;
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
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(-6, -8, 12, 10);
        ctx.fillStyle = '#333';
        ctx.fillRect(-6, 2, 12, 8);
        ctx.fillStyle = '#e0ac69';
        ctx.beginPath();
        ctx.arc(0, -12, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.fillRect(-6, -18, 12, 4);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(-6, -8, 12, 18);
        ctx.restore();
    }
}
