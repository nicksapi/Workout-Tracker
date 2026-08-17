import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { CATEGORIES, CATEGORY_LABELS, EQUIPMENT_OPTIONS, MUSCLE_COLORS } from '../lib/constants.js';

function MuscleChip({ muscle, role }) {
  const color = MUSCLE_COLORS[muscle] || '#94a3b8';
  return (
    <span
      className="chip"
      style={{
        backgroundColor: role === 'primary' ? `${color}26` : '#f1f5f9',
        color: role === 'primary' ? color : '#64748b',
      }}
    >
      {muscle}
    </span>
  );
}

function AddExerciseForm({ muscleGroups, onCreated, onCancel }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('full_body');
  const [equipment, setEquipment] = useState('bodyweight');
  const [selectedMuscles, setSelectedMuscles] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function toggleMuscle(name) {
    setSelectedMuscles((prev) => {
      const next = { ...prev };
      if (next[name]) delete next[name];
      else next[name] = 'primary';
      return next;
    });
  }

  function setRole(name, role) {
    setSelectedMuscles((prev) => ({ ...prev, [name]: role }));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    const muscles = Object.entries(selectedMuscles).map(([muscle, role]) => ({ muscle, role }));
    if (!name.trim()) return setError('Name is required.');
    if (muscles.length === 0) return setError('Tag at least one muscle group.');
    setSaving(true);
    try {
      const created = await api.createExercise({ name: name.trim(), category, equipment, muscles });
      onCreated(created);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-3">
      <h3 className="font-semibold text-slate-900">Add custom exercise</h3>
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      <div>
        <label className="label">Name</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Landmine Press" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Category</label>
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Equipment</label>
          <select className="input" value={equipment} onChange={(e) => setEquipment(e.target.value)}>
            {EQUIPMENT_OPTIONS.map((e) => (
              <option key={e} value={e}>
                {e.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Muscle groups worked</label>
        <div className="flex flex-wrap gap-2">
          {muscleGroups.map((mg) => {
            const active = Boolean(selectedMuscles[mg.name]);
            return (
              <button
                type="button"
                key={mg.name}
                onClick={() => toggleMuscle(mg.name)}
                className={`chip border ${active ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500'}`}
              >
                {mg.name}
              </button>
            );
          })}
        </div>
        {Object.keys(selectedMuscles).length > 0 && (
          <div className="mt-3 space-y-1.5">
            {Object.entries(selectedMuscles).map(([muscle, role]) => (
              <div key={muscle} className="flex items-center justify-between text-sm">
                <span className="capitalize text-slate-700">{muscle}</span>
                <div className="flex gap-1">
                  {['primary', 'secondary'].map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setRole(muscle, r)}
                      className={`chip ${role === r ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save exercise'}
        </button>
      </div>
    </form>
  );
}

export default function ExerciseLibrary() {
  const [exercises, setExercises] = useState([]);
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [muscle, setMuscle] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listMuscleGroups().then(setMuscleGroups);
  }, []);

  useEffect(() => {
    setLoading(true);
    const handle = setTimeout(() => {
      api
        .listExercises({ search, category, muscle })
        .then(setExercises)
        .finally(() => setLoading(false));
    }, 150);
    return () => clearTimeout(handle);
  }, [search, category, muscle]);

  const customCount = useMemo(() => exercises.filter((e) => e.is_custom).length, [exercises]);

  async function handleDelete(id) {
    if (!confirm('Delete this custom exercise?')) return;
    await api.deleteExercise(id);
    setExercises((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Exercise Library</h2>
          <p className="text-sm text-slate-500">
            {exercises.length} exercises {customCount > 0 && `· ${customCount} custom`}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd((v) => !v)}>
          {showAdd ? 'Close' : '+ Add'}
        </button>
      </div>

      {showAdd && (
        <AddExerciseForm
          muscleGroups={muscleGroups}
          onCancel={() => setShowAdd(false)}
          onCreated={(ex) => {
            setExercises((prev) => [...prev, ex].sort((a, b) => a.name.localeCompare(b.name)));
            setShowAdd(false);
          }}
        />
      )}

      <div className="space-y-2">
        <input
          className="input"
          placeholder="Search exercises…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          <select className="input w-auto shrink-0" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
          <select className="input w-auto shrink-0" value={muscle} onChange={(e) => setMuscle(e.target.value)}>
            <option value="">All muscles</option>
            {muscleGroups.map((mg) => (
              <option key={mg.id} value={mg.name}>
                {mg.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-slate-400">Loading…</p>
      ) : exercises.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">No exercises match your filters.</p>
      ) : (
        <ul className="space-y-2">
          {exercises.map((ex) => (
            <li key={ex.id} className="card">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-900">{ex.name}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {CATEGORY_LABELS[ex.category] || ex.category} · {ex.equipment.replace('_', ' ')}
                    {ex.is_custom ? ' · custom' : ''}
                  </p>
                </div>
                {ex.is_custom ? (
                  <button className="btn-ghost !px-2 !py-1 text-red-500" onClick={() => handleDelete(ex.id)}>
                    Delete
                  </button>
                ) : null}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {ex.muscles.map((m) => (
                  <MuscleChip key={m.muscle} muscle={m.muscle} role={m.role} />
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
