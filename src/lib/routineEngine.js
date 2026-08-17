// Rules-based weekly routine generator. No ML — just a lookup table of
// splits keyed by days/week, filtered by goal (sets/reps scheme) and
// experience level (exercises per day), populated from the exercise library.

const GOAL_SCHEMES = {
  strength: { sets: 5, reps: '3-6' },
  hypertrophy: { sets: 4, reps: '8-12' },
  general_fitness: { sets: 3, reps: '10-15' },
  fat_loss: { sets: 3, reps: '12-15' },
};

const EXPERIENCE_COUNTS = {
  beginner: 4,
  intermediate: 5,
  advanced: 6,
};

// Split templates keyed by days/week. Each day: { label, categories, core }
const SPLITS = {
  1: [{ label: 'Full Body', categories: ['push', 'pull', 'legs'], core: true }],
  2: [
    { label: 'Full Body A', categories: ['push', 'pull', 'legs'], core: true },
    { label: 'Full Body B', categories: ['push', 'pull', 'legs'], core: true },
  ],
  3: [
    { label: 'Full Body A', categories: ['push', 'pull', 'legs'], core: true },
    { label: 'Full Body B', categories: ['push', 'pull', 'legs'], core: false },
    { label: 'Full Body C', categories: ['push', 'pull', 'legs'], core: true },
  ],
  4: [
    { label: 'Upper A', categories: ['push', 'pull'], core: false },
    { label: 'Lower A', categories: ['legs'], core: true },
    { label: 'Upper B', categories: ['push', 'pull'], core: false },
    { label: 'Lower B', categories: ['legs'], core: true },
  ],
  5: [
    { label: 'Push', categories: ['push'], core: false },
    { label: 'Pull', categories: ['pull'], core: false },
    { label: 'Legs', categories: ['legs'], core: true },
    { label: 'Upper', categories: ['push', 'pull'], core: false },
    { label: 'Lower', categories: ['legs'], core: true },
  ],
  6: [
    { label: 'Push A', categories: ['push'], core: false },
    { label: 'Pull A', categories: ['pull'], core: false },
    { label: 'Legs A', categories: ['legs'], core: true },
    { label: 'Push B', categories: ['push'], core: false },
    { label: 'Pull B', categories: ['pull'], core: false },
    { label: 'Legs B', categories: ['legs'], core: true },
  ],
};

function clampDays(n) {
  return Math.max(1, Math.min(6, n));
}

// Round-robin merge exercises across categories, so e.g. an "Upper" day
// (push + pull) alternates chest/shoulder/tricep movements with
// back/bicep movements instead of exhausting one category first.
function pickExercises(allExercises, categories, count, variantOffset) {
  const perCategoryLists = categories.map((cat) => {
    const rows = allExercises
      .filter((e) => e.category === cat && e.equipment !== 'cardio_machine')
      .sort((a, b) => a.id - b.id);
    if (rows.length === 0) return rows;
    const offset = variantOffset % rows.length;
    return rows.slice(offset).concat(rows.slice(0, offset));
  });

  const pointers = perCategoryLists.map(() => 0);
  const result = [];
  let addedAny = true;
  while (result.length < count && addedAny) {
    addedAny = false;
    for (let li = 0; li < perCategoryLists.length; li++) {
      if (result.length >= count) break;
      const list = perCategoryLists[li];
      if (pointers[li] < list.length) {
        result.push(list[pointers[li]]);
        pointers[li]++;
        addedAny = true;
      }
    }
  }
  return result;
}

function pickCore(allExercises, variantOffset) {
  const rows = allExercises.filter((e) => e.category === 'core').sort((a, b) => a.id - b.id);
  if (rows.length === 0) return null;
  return rows[variantOffset % rows.length];
}

export function generateRoutine(allExercises, { goal, experienceLevel, daysPerWeek }) {
  const scheme = GOAL_SCHEMES[goal] || GOAL_SCHEMES.general_fitness;
  const exercisesPerDay = EXPERIENCE_COUNTS[experienceLevel] || EXPERIENCE_COUNTS.beginner;
  const requestedDays = clampDays(Number(daysPerWeek) || 3);
  const splitPlan = SPLITS[requestedDays];

  const days = [];
  for (let i = 0; i < 7; i++) {
    if (i < splitPlan.length) {
      const dayDef = splitPlan[i];
      const mainCount = dayDef.core ? Math.max(exercisesPerDay - 1, 2) : exercisesPerDay;
      const picked = pickExercises(allExercises, dayDef.categories, mainCount, i * 2);
      const exercises = picked.map((ex) => ({
        exercise_id: ex.id,
        name: ex.name,
        target_sets: scheme.sets,
        target_reps: scheme.reps,
      }));
      if (dayDef.core) {
        const core = pickCore(allExercises, i);
        if (core) {
          exercises.push({
            exercise_id: core.id,
            name: core.name,
            target_sets: 3,
            target_reps: '12-15',
          });
        }
      }
      days.push({ day_index: i, label: dayDef.label, exercises });
    } else {
      days.push({ day_index: i, label: 'Rest', exercises: [] });
    }
  }

  return {
    goal,
    experience_level: experienceLevel,
    days_per_week: requestedDays,
    scheme,
    days,
  };
}
