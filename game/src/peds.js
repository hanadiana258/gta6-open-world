// authored r12 — written by this agent session
/**
 * Pedestrian simulation: spawning, fleeing behavior, and rendering.
 */
export let peds = [];
let simulationTime = 0;

export function updatePeds(dt, cam) {
    simulationTime += dt;
    
    while (peds.length < 100) {
        peds.push({
            x: Math.random() * 5200,
            y: Math.random() * 5200,
            angle: Math.random() * Math.PI * 2,
            color: `hsl(${Math.random() * 360}, 70%, 50%)`,
            bob: 0
        });
    }

    peds.forEach(p => {
        p.x += Math.cos(p.angle) * 0.5;
        p.y += Math.sin(p.angle) * 0.5;
        if (Math.random() < 0.05) p.angle += (Math.random() - 0.5);
        p.bob = Math.sin(simulationTime * 10) * 2;
    });
}

export function drawPeds(ctx, cam) {
    peds.forEach(p => {
        if (p.x < cam.x - 200 || p.x > cam.x + 1480 || p.y < cam.y - 200 || p.y > cam.y + 920) return;

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(p.x - cam.x, p.y - cam.y, 4, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - cam.x - 5, p.y - cam.y - 12 + p.bob, 10, 10);
        
        ctx.fillStyle = '#ffcc99';
        ctx.beginPath();
        ctx.arc(p.x - cam.x, p.y - cam.y - 15 + p.bob, 4, 0, Math.PI * 2);
        ctx.fill();
    });
}
