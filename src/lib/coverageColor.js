const LOW = [56, 189, 248]; // sky-400 — under-worked
const HIGH = [239, 68, 68]; // red-500 — over-worked relative to an even split
const NEUTRAL = '#e2e8f0'; // slate-200 — nothing logged

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

// 12 muscle groups tracked -> an even split would be ~8.33% each.
// Color ramps from blue (0%) through the midpoint at a "fair share" to red
// at 2x fair share and beyond, so relatively over- and under-trained
// muscles are visually obvious at a glance.
export function coverageColor(percentage, muscleCount = 12) {
  if (!percentage) return NEUTRAL;
  const fairShare = 100 / muscleCount;
  const t = Math.max(0, Math.min(1, percentage / (fairShare * 2)));
  const [r, g, b] = [lerp(LOW[0], HIGH[0], t), lerp(LOW[1], HIGH[1], t), lerp(LOW[2], HIGH[2], t)];
  return `rgb(${r}, ${g}, ${b})`;
}
