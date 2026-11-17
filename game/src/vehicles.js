export class Vehicle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.speed = 0;
        this.type = type; // sedan, sports, taxi, truck
        this.width = 38;
        this.height = 18;
        this.color = this.getColor(type);
        this.isPlayerControlled = false;
    }

    getColor(type) {
        if (type === 'red') return '#b03a2e';
        if (type === 'taxi') return '#f1c40f';
        if (type === 'sedan') return '#7f8c8d';
        if (type === 'blue') return '#2e86c1';
        if (type === 'truck') return '#e67e22';
        return '#34495e';
    }

    update(dt) {
        // NPC logic managed by traffic.js
    }
}

export const vehicles = [];

export function spawnVehicles(count, aroundX, aroundY) {
    // Basic implementation for placing on roads
    for (let i = 0; i < count; i++) {
        const k = Math.floor(Math.random() * 20);
        const lane = Math.random() > 0.5 ? 18 : 52;
        const x = k * 280 + lane;
        const y = Math.random() * 5600;
        const types = ['red', 'taxi', 'sedan', 'blue', 'truck'];
        vehicles.push(new Vehicle(x, y, types[Math.floor(Math.random() * types.length)]));
    }
}

export function drawVehicle(ctx, v, cam) {
    ctx.save();
    ctx.translate(v.x - cam.x, v.y - cam.y);
    ctx.rotate(v.angle);
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(-v.width/2 + 2, -v.height/2 + 2, v.width, v.height);
    
    // Body rounded
    ctx.fillStyle = v.color;
    ctx.beginPath();
    ctx.roundRect(-v.width/2, -v.height/2, v.width, v.height, 4);
    ctx.fill();
    
    // Roof rect
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-v.width/2 + 8, -v.height/2 + 3, v.width - 16, v.height - 6);
    
    // Windshield
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(-v.width/2 + 10, -v.height/2 + 4, v.width - 20, 4);
    
    // Wheels
    ctx.fillStyle = '#000000';
    ctx.fillRect(-v.width/2 + 4, -v.height/2 - 2, 8, 4);
    ctx.fillRect(v.width/2 - 12, -v.height/2 - 2, 8, 4);
    ctx.fillRect(-v.width/2 + 4, v.height/2 - 2, 8, 4);
    ctx.fillRect(v.width/2 - 12, v.height/2 - 2, 8, 4);
    
    if (v.type === 'taxi') {
        ctx.fillStyle = '#fff';
        ctx.fillRect(-4, -4, 8, 3);
    }
    
    ctx.restore();
}

export function drawVehicles(ctx, cam) {
    vehicles.forEach(v => drawVehicle(ctx, v, cam));
}

export function updateVehicles(dt) {
    // idle
}
