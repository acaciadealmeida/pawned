// pawVaseCollision.js — 2D hit test using SAT.js (Separating Axis Theorem).
//
// Why a library instead of "|angle| < threshold"?
// Angle-only checks don't match what you see: the paw art and vase are rectangles in screen space.
// SAT tests real polygon overlap. We use an oriented rectangle for the paw (same angle as CSS rotate)
// and an axis-aligned rectangle for the vase — both in viewport (client) coordinates.

import * as SAT from 'sat'

/**
 * Build a SAT Polygon for an axis-aligned rectangle from getBoundingClientRect().
 * Points are stored in absolute client coordinates; polygon.pos is origin.
 */
function axisAlignedRectToPolygon(rect) {
  const { left, top, width, height } = rect
  return new SAT.Polygon(new SAT.Vector(0, 0), [
    new SAT.Vector(left, top),
    new SAT.Vector(left + width, top),
    new SAT.Vector(left + width, top + height),
    new SAT.Vector(left, top + height),
  ])
}

/**
 * Rotate (lx, ly) clockwise by rad — matches CSS `rotate()` with y increasing downward.
 */
function rotateCwScreen(lx, ly, rad) {
  const c = Math.cos(rad)
  const s = Math.sin(rad)
  return {
    x: lx * c + ly * s,
    y: -lx * s + ly * c,
  }
}

/**
 * Oriented rectangle in client space: center + half-extents + rotation (degrees, CSS-style).
 */
function orientedRectToPolygon(cx, cy, halfW, halfH, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180
  const corners = [
    [-halfW, -halfH],
    [halfW, -halfH],
    [halfW, halfH],
    [-halfW, halfH],
  ].map(([lx, ly]) => {
    const { x, y } = rotateCwScreen(lx, ly, rad)
    return new SAT.Vector(cx + x, cy + y)
  })
  return new SAT.Polygon(new SAT.Vector(0, 0), corners)
}

/**
 * True if the paw strike box overlaps the vase hit box at this instant.
 *
 * @param {HTMLElement|null} pawHitEl — rotates with the pendulum; intrinsic size = strike box
 * @param {HTMLElement|null} vaseHitEl — axis-aligned region over the vase art
 * @param {number} angleDeg — same value as the pendulum's CSS rotate (current swing angle)
 */
export function isPawHittingVase(pawHitEl, vaseHitEl, angleDeg) {
  if (!pawHitEl || !vaseHitEl) return false

  const pawRect = pawHitEl.getBoundingClientRect()
  const vaseRect = vaseHitEl.getBoundingClientRect()

  if (pawRect.width < 1 || pawRect.height < 1 || vaseRect.width < 1 || vaseRect.height < 1) {
    return false
  }

  // Center of the oriented paw box: for a rotated rectangle, AABB center equals shape center.
  const cx = pawRect.left + pawRect.width / 2
  const cy = pawRect.top + pawRect.height / 2

  // Intrinsic half-sizes (layout size, not the inflated screen AABB diagonal).
  const halfW = pawHitEl.offsetWidth / 2
  const halfH = pawHitEl.offsetHeight / 2

  const pawPoly = orientedRectToPolygon(cx, cy, halfW, halfH, angleDeg)
  const vasePoly = axisAlignedRectToPolygon(vaseRect)

  return SAT.testPolygonPolygon(pawPoly, vasePoly)
}
