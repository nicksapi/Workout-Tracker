// Muscle groups with a front/back hint used by the body-map visualization.
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

// [name, category, equipment, [ [muscle, role], ... ]]
export const EXERCISES = [
  // ---- PUSH: chest / shoulders / triceps ----
  ['Barbell Bench Press', 'push', 'barbell', [['chest', 'primary'], ['triceps', 'secondary'], ['shoulders', 'secondary']]],
  ['Incline Barbell Bench Press', 'push', 'barbell', [['chest', 'primary'], ['shoulders', 'secondary'], ['triceps', 'secondary']]],
  ['Decline Barbell Bench Press', 'push', 'barbell', [['chest', 'primary'], ['triceps', 'secondary']]],
  ['Dumbbell Bench Press', 'push', 'dumbbell', [['chest', 'primary'], ['triceps', 'secondary'], ['shoulders', 'secondary']]],
  ['Incline Dumbbell Press', 'push', 'dumbbell', [['chest', 'primary'], ['shoulders', 'secondary']]],
  ['Dumbbell Flyes', 'push', 'dumbbell', [['chest', 'primary']]],
  ['Cable Crossover', 'push', 'cable', [['chest', 'primary']]],
  ['Push-Up', 'push', 'bodyweight', [['chest', 'primary'], ['triceps', 'secondary'], ['shoulders', 'secondary'], ['core', 'secondary']]],
  ['Chest Dip', 'push', 'bodyweight', [['chest', 'primary'], ['triceps', 'secondary']]],
  ['Overhead Barbell Press', 'push', 'barbell', [['shoulders', 'primary'], ['triceps', 'secondary']]],
  ['Dumbbell Shoulder Press', 'push', 'dumbbell', [['shoulders', 'primary'], ['triceps', 'secondary']]],
  ['Arnold Press', 'push', 'dumbbell', [['shoulders', 'primary'], ['triceps', 'secondary']]],
  ['Lateral Raise', 'push', 'dumbbell', [['shoulders', 'primary']]],
  ['Front Raise', 'push', 'dumbbell', [['shoulders', 'primary']]],
  ['Rear Delt Fly', 'push', 'dumbbell', [['shoulders', 'primary'], ['back', 'secondary']]],
  ['Cable Lateral Raise', 'push', 'cable', [['shoulders', 'primary']]],
  ['Machine Shoulder Press', 'push', 'machine', [['shoulders', 'primary'], ['triceps', 'secondary']]],
  ['Triceps Pushdown', 'push', 'cable', [['triceps', 'primary']]],
  ['Overhead Triceps Extension', 'push', 'dumbbell', [['triceps', 'primary']]],
  ['Skull Crushers', 'push', 'barbell', [['triceps', 'primary']]],
  ['Close-Grip Bench Press', 'push', 'barbell', [['triceps', 'primary'], ['chest', 'secondary']]],
  ['Triceps Dip', 'push', 'bodyweight', [['triceps', 'primary'], ['chest', 'secondary']]],

  // ---- PULL: back / biceps / traps ----
  ['Barbell Row', 'pull', 'barbell', [['back', 'primary'], ['biceps', 'secondary']]],
  ['Pendlay Row', 'pull', 'barbell', [['back', 'primary']]],
  ['Dumbbell Row', 'pull', 'dumbbell', [['back', 'primary'], ['biceps', 'secondary']]],
  ['T-Bar Row', 'pull', 'machine', [['back', 'primary']]],
  ['Seated Cable Row', 'pull', 'cable', [['back', 'primary'], ['biceps', 'secondary']]],
  ['Lat Pulldown', 'pull', 'cable', [['back', 'primary'], ['biceps', 'secondary']]],
  ['Pull-Up', 'pull', 'bodyweight', [['back', 'primary'], ['biceps', 'secondary']]],
  ['Chin-Up', 'pull', 'bodyweight', [['back', 'primary'], ['biceps', 'secondary']]],
  ['Single-Arm Dumbbell Row', 'pull', 'dumbbell', [['back', 'primary']]],
  ['Face Pull', 'pull', 'cable', [['shoulders', 'primary'], ['back', 'secondary'], ['traps', 'secondary']]],
  ['Barbell Shrug', 'pull', 'barbell', [['traps', 'primary']]],
  ['Dumbbell Shrug', 'pull', 'dumbbell', [['traps', 'primary']]],
  ['Barbell Curl', 'pull', 'barbell', [['biceps', 'primary']]],
  ['Dumbbell Curl', 'pull', 'dumbbell', [['biceps', 'primary']]],
  ['Hammer Curl', 'pull', 'dumbbell', [['biceps', 'primary'], ['forearms', 'secondary']]],
  ['Preacher Curl', 'pull', 'barbell', [['biceps', 'primary']]],
  ['Cable Curl', 'pull', 'cable', [['biceps', 'primary']]],
  ['Concentration Curl', 'pull', 'dumbbell', [['biceps', 'primary']]],
  ['Reverse Curl', 'pull', 'barbell', [['forearms', 'primary'], ['biceps', 'secondary']]],

  // ---- LEGS: quads / hamstrings / glutes / calves ----
  ['Barbell Back Squat', 'legs', 'barbell', [['quads', 'primary'], ['glutes', 'secondary'], ['hamstrings', 'secondary']]],
  ['Front Squat', 'legs', 'barbell', [['quads', 'primary'], ['glutes', 'secondary']]],
  ['Goblet Squat', 'legs', 'dumbbell', [['quads', 'primary'], ['glutes', 'secondary']]],
  ['Leg Press', 'legs', 'machine', [['quads', 'primary'], ['glutes', 'secondary']]],
  ['Walking Lunge', 'legs', 'dumbbell', [['quads', 'primary'], ['glutes', 'secondary'], ['hamstrings', 'secondary']]],
  ['Bulgarian Split Squat', 'legs', 'dumbbell', [['quads', 'primary'], ['glutes', 'secondary']]],
  ['Leg Extension', 'legs', 'machine', [['quads', 'primary']]],
  ['Romanian Deadlift', 'legs', 'barbell', [['hamstrings', 'primary'], ['glutes', 'secondary'], ['back', 'secondary']]],
  ['Conventional Deadlift', 'legs', 'barbell', [['hamstrings', 'primary'], ['glutes', 'primary'], ['back', 'secondary'], ['traps', 'secondary']]],
  ['Lying Leg Curl', 'legs', 'machine', [['hamstrings', 'primary']]],
  ['Seated Leg Curl', 'legs', 'machine', [['hamstrings', 'primary']]],
  ['Hip Thrust', 'legs', 'barbell', [['glutes', 'primary'], ['hamstrings', 'secondary']]],
  ['Glute Bridge', 'legs', 'bodyweight', [['glutes', 'primary']]],
  ['Cable Pull-Through', 'legs', 'cable', [['glutes', 'primary'], ['hamstrings', 'secondary']]],
  ['Standing Calf Raise', 'legs', 'machine', [['calves', 'primary']]],
  ['Seated Calf Raise', 'legs', 'machine', [['calves', 'primary']]],
  ['Hip Abduction Machine', 'legs', 'machine', [['glutes', 'primary']]],

  // ---- CORE ----
  ['Plank', 'core', 'bodyweight', [['core', 'primary']]],
  ['Side Plank', 'core', 'bodyweight', [['core', 'primary']]],
  ['Hanging Leg Raise', 'core', 'bodyweight', [['core', 'primary']]],
  ['Cable Crunch', 'core', 'cable', [['core', 'primary']]],
  ['Sit-Up', 'core', 'bodyweight', [['core', 'primary']]],
  ['Russian Twist', 'core', 'bodyweight', [['core', 'primary']]],
  ['Ab Wheel Rollout', 'core', 'bodyweight', [['core', 'primary']]],
  ['Mountain Climbers', 'core', 'bodyweight', [['core', 'primary'], ['shoulders', 'secondary']]],

  // ---- CARDIO / FULL BODY ----
  ['Treadmill Run', 'cardio', 'cardio_machine', [['quads', 'secondary'], ['hamstrings', 'secondary'], ['calves', 'secondary']]],
  ['Rowing Machine', 'cardio', 'cardio_machine', [['back', 'secondary'], ['quads', 'secondary'], ['hamstrings', 'secondary']]],
  ['Stationary Bike', 'cardio', 'cardio_machine', [['quads', 'secondary'], ['calves', 'secondary']]],
  ['Kettlebell Swing', 'full_body', 'kettlebell', [['glutes', 'primary'], ['hamstrings', 'primary'], ['shoulders', 'secondary'], ['core', 'secondary']]],
  ['Burpee', 'full_body', 'bodyweight', [['quads', 'primary'], ['chest', 'secondary'], ['shoulders', 'secondary'], ['core', 'secondary']]],
  ['Barbell Clean and Press', 'full_body', 'barbell', [['shoulders', 'primary'], ['quads', 'secondary'], ['back', 'secondary']]],
  ["Farmer's Carry", 'full_body', 'dumbbell', [['forearms', 'primary'], ['traps', 'secondary'], ['core', 'secondary']]],
  ['Thruster', 'full_body', 'dumbbell', [['quads', 'primary'], ['shoulders', 'secondary'], ['core', 'secondary']]],
];

export function seedIfEmpty(db) {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM muscle_groups').get();
  if (count === 0) {
    const insertMuscle = db.prepare('INSERT INTO muscle_groups (name, front_or_back) VALUES (?, ?)');
    const tx = db.transaction((rows) => {
      for (const m of rows) insertMuscle.run(m.name, m.front_or_back);
    });
    tx(MUSCLE_GROUPS);
  }

  const { count: exCount } = db.prepare('SELECT COUNT(*) AS count FROM exercises').get();
  if (exCount === 0) {
    const muscleIdByName = new Map(
      db.prepare('SELECT id, name FROM muscle_groups').all().map((r) => [r.name, r.id])
    );
    const insertExercise = db.prepare(
      'INSERT INTO exercises (name, category, equipment, is_custom) VALUES (?, ?, ?, 0)'
    );
    const insertLink = db.prepare(
      'INSERT INTO exercise_muscles (exercise_id, muscle_group_id, role) VALUES (?, ?, ?)'
    );
    const tx = db.transaction((rows) => {
      for (const [name, category, equipment, muscles] of rows) {
        const info = insertExercise.run(name, category, equipment);
        for (const [muscleName, role] of muscles) {
          const muscleId = muscleIdByName.get(muscleName);
          if (muscleId) insertLink.run(info.lastInsertRowid, muscleId, role);
        }
      }
    });
    tx(EXERCISES);
  }
}
