// authored r12 — restructured by the agent session (renamed internals, own control flow)
/**
 * @fileoverview Minimap overlay for Solano Drive: a clipped 180px square in the
 * lower-left corner showing districts, the road grid, and every tracked entity.
 */

import { BLOCK_SIZE } from './constants.js';

const FRAME = {
  side: 180,
  left: 14,
  top: 720 - 194,
};

const WORLD = {
  span: 5600,
  gridLines: 20,
};

const SKIN = {
  back: '#101010',
  edge: '#fff',
  road: '#555',
  roadWidth: 3,
  districts: [
    { cols: 7, tint: 'rgba(217, 197, 138, 0.3)' },
    { cols: 7, tint: 'rgba(128, 149, 168, 0.3)' },
    { cols: 6, tint: 'rgba(124, 179, 66, 0.3)' },
  ],
  trafficDot: 'white',
  policeDot: 'red',
  targetDot: 'yellow',
  playerDot: 'white',
};

/** Paints the background plate, then tiles the district bands left to right. */
function paintBase(g, left, top, side, unit) {
  g.fillStyle = SKIN.back;
  g.fillRect(left, top, side, side);
  g.strokeStyle = SKIN.edge;
  g.lineWidth = 2;
  g.strokeRect(left, top, side, side);
  let cursor = 0;
  for (const band of SKIN.districts) {
    g.fillStyle = band.tint;
    g.fillRect(left + cursor * unit, top, band.cols * unit, side);
    cursor += band.cols;
  }
}

/** Evenly spaced streets in both directions inside the clipped square. */
function paintStreets(g, left, top, side, unit) {
  g.strokeStyle = SKIN.road;
  g.lineWidth = SKIN.roadWidth;
  for (let i = 0; i < WORLD.gridLines; i++) {
    g.beginPath();
    g.moveTo(left + i * unit, top);
    g.lineTo(left + i * unit, top + side);
    g.stroke();
    g.beginPath();
    g.moveTo(left, top + i * unit);
    g.lineTo(left + side, top + i * unit);
    g.stroke();
  }
}

/** Small squares for traffic cars and police cruisers. */
function paintFleet(g, left, top, unit, entities, colour, dot) {
  g.fillStyle = colour;
  for (const item of entities) {
    g.fillRect(left + item.x * unit - dot / 2, top + item.y * unit - dot / 2, dot, dot);
  }
}

/** Pulsing yellow ring on the destination the mission points at. */
function paintTarget(g, left, top, unit, mission) {
  const goal = mission.missions[mission.currentMissionIndex].target;
  g.fillStyle = SKIN.targetDot;
  g.beginPath();
  g.arc(left + goal.x * unit, top + goal.y * unit, 5, 0, Math.PI * 2);
  g.fill();
}

/** The player's own marker, a small upward triangle. */
function paintPlayer(g, left, top, unit, p) {
  const px = left + p.x * unit;
  const py = top + p.y * unit;
  g.fillStyle = SKIN.playerDot;
  g.beginPath();
  g.moveTo(px, py - 6);
  g.lineTo(px - 4, py + 4);
  g.lineTo(px + 4, py + 4);
  g.fill();
}

class MapOverlay {
  render(g, { player, policeSystem, missionSystem: missionManager, traffic }) {
    const { side, left, top } = FRAME;
    const unit = side / WORLD.span;

    paintBase(g, left, top, side, unit);
    g.save();
    g.beginPath();
    g.rect(left, top, side, side);
    g.clip();

    paintStreets(g, left, top, side, unit);
    paintFleet(g, left, top, unit, traffic, SKIN.trafficDot, 2);
    paintFleet(g, left, top, unit, policeSystem.units, SKIN.policeDot, 4);
    if (missionManager.active) paintTarget(g, left, top, unit, missionManager);
    paintPlayer(g, left, top, unit, player);

    g.restore();
  }

  // legacy entry point kept so main.js keeps its original call site
  drawMinimap(g, world) {
    this.render(g, world);
  }
}

export const minimapSystem = new MapOverlay();
export const MinimapManager = minimapSystem;
