async function request(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || `Request failed: ${res.status}`);
  }
  return data;
}

const qs = (params = {}) => {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (entries.length === 0) return '';
  return '?' + new URLSearchParams(entries).toString();
};

export const api = {
  // Exercises
  listExercises: (params) => request('GET', `/api/exercises${qs(params)}`),
  getExercise: (id) => request('GET', `/api/exercises/${id}`),
  createExercise: (payload) => request('POST', '/api/exercises', payload),
  deleteExercise: (id) => request('DELETE', `/api/exercises/${id}`),
  lastPerformance: (id) => request('GET', `/api/exercises/${id}/last`),
  exerciseHistory: (id) => request('GET', `/api/exercises/${id}/history`),

  // Muscle groups
  listMuscleGroups: () => request('GET', '/api/muscle-groups'),

  // Workouts
  listWorkouts: (params) => request('GET', `/api/workouts${qs(params)}`),
  getWorkout: (id) => request('GET', `/api/workouts/${id}`),
  startWorkout: (payload) => request('POST', '/api/workouts', payload),
  updateWorkout: (id, payload) => request('PUT', `/api/workouts/${id}`, payload),
  completeWorkout: (id) => request('POST', `/api/workouts/${id}/complete`),
  deleteWorkout: (id) => request('DELETE', `/api/workouts/${id}`),
  addExerciseToWorkout: (workoutId, exerciseId) =>
    request('POST', `/api/workouts/${workoutId}/exercises`, { exercise_id: exerciseId }),
  removeExerciseFromWorkout: (workoutId, weId) =>
    request('DELETE', `/api/workouts/${workoutId}/exercises/${weId}`),
  addSet: (workoutId, weId, payload) =>
    request('POST', `/api/workouts/${workoutId}/exercises/${weId}/sets`, payload),
  updateSet: (workoutId, setId, payload) =>
    request('PUT', `/api/workouts/${workoutId}/sets/${setId}`, payload),
  deleteSet: (workoutId, setId) => request('DELETE', `/api/workouts/${workoutId}/sets/${setId}`),

  // Templates
  listTemplates: () => request('GET', '/api/templates'),
  getTemplate: (id) => request('GET', `/api/templates/${id}`),
  createTemplate: (payload) => request('POST', '/api/templates', payload),
  updateTemplate: (id, payload) => request('PUT', `/api/templates/${id}`, payload),
  deleteTemplate: (id) => request('DELETE', `/api/templates/${id}`),
  saveTemplateFromWorkout: (workoutId, name) =>
    request('POST', `/api/templates/from-workout/${workoutId}`, { name }),

  // Routines
  listRoutines: () => request('GET', '/api/routines'),
  getRoutine: (id) => request('GET', `/api/routines/${id}`),
  generateRoutine: (payload) => request('POST', '/api/routines/generate', payload),
  saveRoutine: (payload) => request('POST', '/api/routines', payload),
  activateRoutine: (id) => request('POST', `/api/routines/${id}/activate`),
  deleteRoutine: (id) => request('DELETE', `/api/routines/${id}`),

  // Stats
  getCoverage: (days) => request('GET', `/api/stats/coverage${qs({ days })}`),
};
