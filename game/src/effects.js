// rebuilt r8 — authored in this session
export const effectsSystem = {
    skids: [],
    exhaust: [],
    addSkid(x, y) {
        this.skids.push({ x, y, life: 1.0 });
    },
    addExhaust(x, y, angle) {
        this.exhaust.push({ x, y, angle, life: 1.0 });
    },
    update(dt) {
        this.skids = this.skids.filter(s => { s.life -= 0.01; return s.life > 0; });
        this.exhaust = this.exhaust.filter(e => { 
            e.x += Math.cos(e.angle) * 2; 
            e.y += Math.sin(e.angle) * 2; 
            e.life -= 0.05; 
            return e.life > 0; 
        });
    },
    draw(ctx, cam) {
        // Skids
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.skids.forEach(s => {
            ctx.fillRect(s.x - cam.x, s.y - cam.y, 4, 4);
        });
        // Exhaust
        ctx.fillStyle = 'rgba(200,200,200,0.5)';
        this.exhaust.forEach(e => {
            ctx.beginPath();
            ctx.arc(e.x - cam.x, e.y - cam.y, 2 * e.life, 0, Math.PI * 2);
            ctx.fill();
        });
    }
};
