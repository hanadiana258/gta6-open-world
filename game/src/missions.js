export const missionSystem = {
    active: true,
    current: 0,
    money: 0,
    list: [
        { id: 1, name: "The Drop", target: { x: 15*280, y: 12*280 }, reward: 100 },
        { id: 2, name: "Escort", target: { x: 3000, y: 3000 }, reward: 200 },
        { id: 3, name: "Sabotage", target: { x: 2500, y: 2800 }, reward: 300 },
        { id: 4, name: "Courier", target: { x: 2800, y: 2400 }, reward: 400 },
        { id: 5, name: "Clearance", target: { x: 2200, y: 2200 }, reward: 500 },
        { id: 6, name: "Theft", target: { x: 2700, y: 2700 }, reward: 600 },
        { id: 7, name: "Extraction", target: { x: 2400, y: 2900 }, reward: 700 },
        { id: 8, name: "Final Showdown", target: { x: 2600, y: 2600 }, reward: 1000 }
    ],
    update(dt, player) {
        if (!this.active) return;
        const m = this.list[this.current];
        if (Math.hypot(player.x - m.target.x, player.y - m.target.y) < 100) {
            this.money += m.reward;
            this.current = (this.current + 1) % this.list.length;
        }
    },
    drawMarkers(ctx, cam) {
        if (!this.active) return;
        const m = this.list[this.current];
        const t = Date.now() / 1000;
        const radius = 26 + 6 * Math.sin(t * 4);
        
        ctx.save();
        ctx.translate(m.target.x - cam.x, m.target.y - cam.y);
        
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(241,196,15,0.25)";
        ctx.fill();
        ctx.strokeStyle = "#f1c40f";
        ctx.lineWidth = 4;
        ctx.stroke();
        
        ctx.fillStyle = "#f1c40f";
        ctx.font = "bold 24px Arial";
        ctx.fillText("$", -6, -radius - 10);
        ctx.restore();
    }
};
