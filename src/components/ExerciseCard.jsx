import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';

export default function ExerciseCard({ workoutId, we, onWorkoutUpdate, onRemove }) {
  const [lastSets, setLastSets] = useState(null);
  const [draft, setDraft] = useState({ reps: '', weight: '', weight_unit: 'lb' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.lastPerformance(we.exercise_id).then((res) => setLastSets(res.sets));
  }, [we.exercise_id]);

  useEffect(() => {
    if (lastSets === null) return;
    const nextIndex = we.sets.length;
    const fromLast = lastSets[nextIndex];
    const fromThisSession = we.sets[we.sets.length - 1];
    const source = fromThisSession || fromLast;
    setDraft({
      reps: source?.reps ?? '',
      weight: source?.weight ?? '',
      weight_unit: source?.weight_unit ?? 'lb',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastSets, we.sets.length]);

  async function logSet() {
    setSaving(true);
    try {
      const payload = {
        reps: draft.reps === '' ? null : Number(draft.reps),
        weight: draft.weight === '' ? null : Number(draft.weight),
        weight_unit: draft.weight_unit,
      };
      const res = await api.addSet(workoutId, we.id, payload);
      onWorkoutUpdate(res.workout);
    } finally {
      setSaving(false);
    }
  }

  async function deleteSet(setId) {
    const workout = await api.deleteSet(workoutId, setId);
    onWorkoutUpdate(workout);
  }

  const hasPrefill = lastSets && lastSets.length > 0 && we.sets.length < lastSets.length;

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-slate-900">{we.exercise_name}</p>
          <p className="text-xs uppercase tracking-wide text-slate-400">{we.category?.replace('_', ' ')}</p>
        </div>
        <button className="btn-ghost !px-2 !py-1 text-red-500" onClick={onRemove}>
          Remove
        </button>
      </div>

      {we.sets.length > 0 && (
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-slate-400">
              <th className="w-8 pb-1">Set</th>
              <th className="pb-1">Reps</th>
              <th className="pb-1">Weight</th>
              <th className="w-8 pb-1" />
            </tr>
          </thead>
          <tbody>
            {we.sets.map((s) => (
              <tr key={s.id} className="border-t border-slate-100">
                <td className="py-1.5 text-slate-500">{s.set_number}</td>
                <td className="py-1.5 font-medium text-slate-900">{s.reps ?? '—'}</td>
                <td className="py-1.5 font-medium text-slate-900">
                  {s.weight ?? '—'} {s.weight != null ? s.weight_unit : ''}
                </td>
                <td className="py-1.5 text-right">
                  <button className="text-slate-300 hover:text-red-500" onClick={() => deleteSet(s.id)}>
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-3 flex items-end gap-2">
        <div className="flex-1">
          <label className="label">Reps</label>
          <input
            type="number"
            inputMode="numeric"
            className="input"
            value={draft.reps}
            onChange={(e) => setDraft((d) => ({ ...d, reps: e.target.value }))}
          />
        </div>
        <div className="flex-1">
          <label className="label">Weight</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            className="input"
            value={draft.weight}
            onChange={(e) => setDraft((d) => ({ ...d, weight: e.target.value }))}
          />
        </div>
        <select
          className="input w-16 shrink-0"
          value={draft.weight_unit}
          onChange={(e) => setDraft((d) => ({ ...d, weight_unit: e.target.value }))}
        >
          <option value="lb">lb</option>
          <option value="kg">kg</option>
        </select>
        <button className="btn-primary shrink-0" onClick={logSet} disabled={saving}>
          + Set
        </button>
      </div>
      {hasPrefill && (
        <p className="mt-1.5 text-xs text-slate-400">Prefilled from your last {we.exercise_name} session.</p>
      )}
    </div>
  );
}
