// Simplified body silhouette geometry (viewBox 0 0 200 300) used by the
// Muscle Coverage tab. Shapes with muscle: null are neutral silhouette
// parts (head, hands, feet) that are never colored by coverage data.

const NEUTRAL = [
  { muscle: null, shape: 'circle', cx: 100, cy: 20, r: 14 }, // head
  { muscle: null, shape: 'rect', x: 92, y: 32, w: 16, h: 10, rx: 3 }, // neck
  { muscle: null, shape: 'ellipse', cx: 34, cy: 130, rx: 7, ry: 8 }, // left hand
  { muscle: null, shape: 'ellipse', cx: 166, cy: 130, rx: 7, ry: 8 }, // right hand
  { muscle: null, shape: 'rect', x: 62, y: 268, w: 24, h: 10, rx: 4 }, // left foot
  { muscle: null, shape: 'rect', x: 114, y: 268, w: 24, h: 10, rx: 4 }, // right foot
];

export const FRONT_SHAPES = [
  ...NEUTRAL,
  { muscle: 'shoulders', shape: 'ellipse', cx: 56, cy: 54, rx: 15, ry: 11, label: 'L' },
  { muscle: 'shoulders', shape: 'ellipse', cx: 144, cy: 54, rx: 15, ry: 11, label: 'R' },
  { muscle: 'chest', shape: 'rect', x: 68, y: 46, w: 64, h: 30, rx: 8 },
  { muscle: 'core', shape: 'rect', x: 74, y: 76, w: 52, h: 48, rx: 6 },
  { muscle: 'biceps', shape: 'rect', x: 36, y: 58, w: 18, h: 42, rx: 6 },
  { muscle: 'biceps', shape: 'rect', x: 146, y: 58, w: 18, h: 42, rx: 6 },
  { muscle: 'forearms', shape: 'rect', x: 34, y: 100, w: 16, h: 40, rx: 6 },
  { muscle: 'forearms', shape: 'rect', x: 150, y: 100, w: 16, h: 40, rx: 6 },
  { muscle: 'quads', shape: 'rect', x: 72, y: 128, w: 26, h: 66, rx: 8 },
  { muscle: 'quads', shape: 'rect', x: 102, y: 128, w: 26, h: 66, rx: 8 },
  { muscle: 'calves', shape: 'rect', x: 72, y: 200, w: 24, h: 64, rx: 8 },
  { muscle: 'calves', shape: 'rect', x: 104, y: 200, w: 24, h: 64, rx: 8 },
];

export const BACK_SHAPES = [
  ...NEUTRAL,
  { muscle: null, shape: 'ellipse', cx: 56, cy: 54, rx: 15, ry: 11 },
  { muscle: null, shape: 'ellipse', cx: 144, cy: 54, rx: 15, ry: 11 },
  { muscle: 'traps', shape: 'polygon', points: '78,36 122,36 140,60 60,60' },
  { muscle: 'back', shape: 'rect', x: 68, y: 58, w: 64, h: 54, rx: 8 },
  { muscle: 'triceps', shape: 'rect', x: 36, y: 58, w: 18, h: 42, rx: 6 },
  { muscle: 'triceps', shape: 'rect', x: 146, y: 58, w: 18, h: 42, rx: 6 },
  { muscle: 'forearms', shape: 'rect', x: 34, y: 100, w: 16, h: 40, rx: 6 },
  { muscle: 'forearms', shape: 'rect', x: 150, y: 100, w: 16, h: 40, rx: 6 },
  { muscle: 'glutes', shape: 'rect', x: 72, y: 114, w: 56, h: 30, rx: 10 },
  { muscle: 'hamstrings', shape: 'rect', x: 72, y: 146, w: 26, h: 54, rx: 8 },
  { muscle: 'hamstrings', shape: 'rect', x: 102, y: 146, w: 26, h: 54, rx: 8 },
  { muscle: 'calves', shape: 'rect', x: 72, y: 200, w: 24, h: 64, rx: 8 },
  { muscle: 'calves', shape: 'rect', x: 104, y: 200, w: 24, h: 64, rx: 8 },
];
