// authored r9 — written by this agent session
// Menu System
export const menuSystem = {
    active: true,
    draw(ctx) {
        if (!this.active) return;
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, 1280, 720);
        ctx.fillStyle = 'white';
        ctx.font = '50px Arial';
        ctx.fillText('SOLANO DRIVE', 500, 300);
    }
};
// PERTURB r10 1794988484044399171
