/**
 * @fileoverview Heads-up display for Solano Drive: health gauge, cash readout,
 * wanted stars and the mission banner, drawn on one canvas layer.
 */

const LAYOUT = {
  gauge: { x: 20, y: 20, w: 180, h: 14 },
  cash: { x: 20, y: 64, size: 20 },
  starRowStart: 1280 - 140,
  starStep: 22,
  starY: 30,
  banner: { x: 440, y: 640, w: 400, h: 30, centerX: 640, baseline: 662 },
  maxWanted: 5,
};

const PALETTE = {
  gaugeTrack: '#333',
  gaugeFill: '#c0392b',
  gaugeEdge: '#000',
  cash: '#f1c40f',
  starLit: '#f1c40f',
  starDim: '#666',
  bannerBack: 'rgba(0,0,0,0.7)',
  bannerText: '#fff',
  hidden: 'transparent',
};

/** Five-point star outline centred on (cx, cy). */
function traceStar(g, cx, cy, radius) {
  for (let point = 0; point < 5; point++) {
    const angle = point * Math.PI * 0.8 - Math.PI / 2;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    if (point === 0) g.moveTo(px, py);
    else g.lineTo(px, py);
  }
  g.closePath();
}

class Hud {
  /** Health bar with border, scaled to the player's current hit points. */
  paintGauge(g, health) {
    const { x, y, w, h } = LAYOUT.gauge;
    g.fillStyle = PALETTE.gaugeTrack;
    g.fillRect(x, y, w, h);
    g.fillStyle = PALETTE.gaugeFill;
    g.fillRect(x, y, w * (health / 100), h);
    g.strokeStyle = PALETTE.gaugeEdge;
    g.strokeRect(x, y, w, h);
  }

  /** Yellow cash figure, fixed 15,000 wallet. */
  paintCash(g) {
    g.fillStyle = PALETTE.cash;
    g.font = `bold ${LAYOUT.cash.size}px Arial`;
    g.fillText('$' + (15000).toLocaleString(), LAYOUT.cash.x, LAYOUT.cash.y);
  }

  /** Wanted level as a row of stars; dim outline for unearned stars. */
  paintStars(g, level) {
    for (let slot = 0; slot < LAYOUT.maxWanted; slot++) {
      const lit = slot < level;
      g.fillStyle = lit ? PALETTE.starLit : PALETTE.hidden;
      g.strokeStyle = lit ? PALETTE.starLit : PALETTE.starDim;
      g.lineWidth = 2;
      g.beginPath();
      traceStar(g, LAYOUT.starRowStart + slot * LAYOUT.starStep, LAYOUT.starY, 10);
      g.fill();
      g.stroke();
    }
  }

  /** Dark strip naming the current objective while a mission is running. */
  paintBanner(g, text) {
    const { x, y, w, h, centerX, baseline } = LAYOUT.banner;
    g.fillStyle = PALETTE.bannerBack;
    g.fillRect(x, y, w, h);
    g.fillStyle = PALETTE.bannerText;
    g.textAlign = 'center';
    g.fillText(text, centerX, baseline);
  }

  render(g, { player, wantedSystem, missionSystem: missionManager }) {
    this.paintGauge(g, player.health);
    this.paintCash(g);
    this.paintStars(g, wantedSystem.level || 0);
    if (missionManager.active) {
      this.paintBanner(g, 'REACH THE MARKER');
    }
  }

  // legacy entry point kept so main.js keeps its original call site
  drawHUD(g, world) {
    this.render(g, world);
  }
}

export const hudSystem = new Hud();
export const HudManager = hudSystem;
