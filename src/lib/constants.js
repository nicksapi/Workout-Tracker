export const CATEGORIES = ['push', 'pull', 'legs', 'core', 'cardio', 'full_body'];

export const CATEGORY_LABELS = {
  push: 'Push',
  pull: 'Pull',
  legs: 'Legs',
  core: 'Core',
  cardio: 'Cardio',
  full_body: 'Full Body',
};

export const EQUIPMENT_OPTIONS = [
  'barbell',
  'dumbbell',
  'machine',
  'cable',
  'bodyweight',
  'kettlebell',
  'cardio_machine',
  'other',
];

// The ~12 tracked muscle groups, tagged front/back/both for the coverage body map.
export const MUSCLE_GROUPS = [
  { name: 'chest', front_or_back: 'front' },
  { name: 'shoulders', front_or_back: 'front' },
  { name: 'biceps', front_or_back: 'front' },
  { name: 'triceps', front_or_back: 'back' },
  { name: 'forearms', front_or_back: 'both' },
  { name: 'back', front_or_back: 'back' },
  { name: 'traps', front_or_back: 'back' },
  { name: 'core', front_or_back: 'front' },
  { name: 'quads', front_or_back: 'front' },
  { name: 'hamstrings', front_or_back: 'back' },
  { name: 'glutes', front_or_back: 'back' },
  { name: 'calves', front_or_back: 'both' },
];

// Kept distinct from the orange brand accent (see back/traps below, which
// used to be orange-family and would otherwise be mistaken for UI chrome).
export const MUSCLE_COLORS = {
  chest: '#0ea5e9',
  shoulders: '#38bdf8',
  biceps: '#22c55e',
  triceps: '#84cc16',
  forearms: '#cbd5e1',
  back: '#14b8a6',
  traps: '#818cf8',
  core: '#eab308',
  quads: '#a855f7',
  hamstrings: '#c084fc',
  glutes: '#ec4899',
  calves: '#94a3b8',
};
