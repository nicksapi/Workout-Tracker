// Sequential single-hue ramp (orange) for muscle-volume magnitude, tuned for
// a dark surface: low volume recedes toward the background, high volume
// brightens and pops — the inverse direction of a light-surface ramp.
const LOW = [38, 30, 26]; // near-background warm-dark — "nothing logged"
const HIGH = [253, 186, 116]; // orange-300 — vivid, high volume

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

export function coverageColor(percentage, muscleCount = 12) {
  if (!percentage) return `rgb(${LOW.join(', ')})`;
  // Ramp saturates by ~2x an even split, so meaningfully over-worked
  // muscles read as fully bright rather than needing extreme percentages.
  const fairShare = 100 / muscleCount;
  const t = Math.max(0, Math.min(1, percentage / (fairShare * 2)));
  const [r, g, b] = [lerp(LOW[0], HIGH[0], t), lerp(LOW[1], HIGH[1], t), lerp(LOW[2], HIGH[2], t)];
  return `rgb(${r}, ${g}, ${b})`;
}
