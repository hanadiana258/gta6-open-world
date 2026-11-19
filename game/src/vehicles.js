/**
 * Vehicle entity and street-parking registry for Solano Drive.
 * Exports keep their original names so traffic.js and main.js are untouched.
 */

const PAINT_BY_TYPE = {
  red: '#b03a2e',
  taxi: '#f1c40f',
  sedan: '#7f8c8d',
  blue: '#2e86c1',
  truck: '#e67e22',
};

const BODY = {
  defaultWidth: 38,
  defaultHeight: 18,
  corner: 4,
  cabinInsetX: 8,
  cabinInsetY: 3,
  windshieldInsetX: 10,
  windshieldHeight: 4,
  wheelLength: 8,
  wheelThickness: 4,
  wheelOverhang: 2,
  taxiSignSize: 8,
  shadowOffset: 2,
  shadow: 'rgba(0,0,0,0.4)',
  glass: '#1a1a1a',
  roofTrim: '#2c3e50',
  tyre: '#000000',
  taxiSign: '#fff',
};

export class Vehicle {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.speed = 0;
    this.type = type; // red, taxi, sedan, blue, truck
    this.width = BODY.defaultWidth;
    this.height = BODY.defaultHeight;
    this.color = PAINT_BY_TYPE[type] || '#34495e';
    this.isPlayerControlled = false;
  }
}

export const vehicles = [];

/** Fills both kerb lanes (x=18 and x=52) with parked cars along the whole map. */
export function spawnVehicles(count) {
  const typeNames = Object.keys(PAINT_BY_TYPE);
  for (let n = 0; n < count; n++) {
    const kerb = Math.random() > 0.5 ? 18 : 52;
    const x = Math.floor(Math.random() * 20) * 280 + kerb;
    const y = Math.random() * 5600;
    const type = typeNames[Math.floor(Math.random() * typeNames.length)];
    vehicles.push(new Vehicle(x, y, type));
  }
}

/** One car body in local space: shadow, shell, glass, roof trim, four wheels. */
export function drawVehicle(g, car, cam) {
  const { width: w, height: h } = car;
  g.save();
  g.translate(car.x - cam.x, car.y - cam.y);
  g.rotate(car.angle);

  g.fillStyle = BODY.shadow;
  g.fillRect(-w / 2 + BODY.shadowOffset, -h / 2 + BODY.shadowOffset, w, h);

  g.fillStyle = car.color;
  g.beginPath();
  g.roundRect(-w / 2, -h / 2, w, h, BODY.corner);
  g.fill();

  g.fillStyle = BODY.glass;
  g.fillRect(-w / 2 + BODY.cabinInsetX, -h / 2 + BODY.cabinInsetY, w - 2 * BODY.cabinInsetX, h - 2 * BODY.cabinInsetY);

  g.fillStyle = BODY.roofTrim;
  g.fillRect(-w / 2 + BODY.windshieldInsetX, -h / 2 + BODY.windshieldInsetY, w - 2 * BODY.windshieldInsetX, BODY.windshieldHeight);

  g.fillStyle = BODY.tyre;
  const rearX = -w / 2 + BODY.wheelOverhang;
  const frontX = w / 2 - BODY.wheelOverhang - BODY.wheelLength;
  g.fillRect(rearX, -h / 2 - BODY.wheelOverhang, BODY.wheelLength, BODY.wheelThickness);
  g.fillRect(frontX, -h / 2 - BODY.wheelOverhang, BODY.wheelLength, BODY.wheelThickness);
  g.fillRect(rearX, h / 2 - BODY.wheelThickness + BODY.wheelOverhang, BODY.wheelLength, BODY.wheelThickness);
  g.fillRect(frontX, h / 2 - BODY.wheelThickness + BODY.wheelOverhang, BODY.wheelLength, BODY.wheelThickness);

  if (car.type === 'taxi') {
    g.fillStyle = BODY.taxiSign;
    const sign = BODY.taxiSignSize;
    g.fillRect(-sign / 2, -h / 2 - 1, sign, 3);
  }
  g.restore();
}

export function drawVehicles(g, cam) {
  for (const car of vehicles) drawVehicle(g, car, cam);
}

// Parked cars never move on their own; kept for the main loop's call signature.
export function updateVehicles(dt) {}
