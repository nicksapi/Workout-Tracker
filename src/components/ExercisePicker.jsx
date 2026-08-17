import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { CATEGORIES, CATEGORY_LABELS } from '../lib/constants.js';

export default function ExercisePicker({ onPick, onClose }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const handle = setTimeout(() => {
      api
        .listExercises({ search, category })
        .then(setExercises)
        .finally(() => setLoading(false));
    }, 150);
    return () => clearTimeout(handle);
  }, [search, category]);

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 sm:items-center" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-t-2xl border border-neutral-800 bg-neutral-900 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
          <h3 className="font-semibold text-neutral-50">Add exercise</h3>
          <button className="btn-ghost !px-2 !py-1" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="space-y-2 border-b border-neutral-800 p-3">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">🔍</span>
            <input
              autoFocus
              className="input pl-9"
              placeholder="Type to search exercises…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              className={`chip shrink-0 border ${!category ? 'border-brand-600 bg-brand-500/15 text-brand-400' : 'border-neutral-700 text-neutral-400'}`}
              onClick={() => setCategory('')}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={`chip shrink-0 border ${category === c ? 'border-brand-600 bg-brand-500/15 text-brand-400' : 'border-neutral-700 text-neutral-400'}`}
                onClick={() => setCategory(c)}
              >
                {CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <p className="py-6 text-center text-sm text-neutral-500">Loading…</p>
          ) : exercises.length === 0 ? (
            <p className="py-6 text-center text-sm text-neutral-500">No matches.</p>
          ) : (
            <ul className="space-y-1.5">
              {exercises.map((ex) => (
                <li key={ex.id}>
                  <button
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left hover:bg-neutral-800 active:bg-neutral-700"
                    onClick={() => onPick(ex)}
                  >
                    <span>
                      <span className="block font-medium text-neutral-100">{ex.name}</span>
                      <span className="block text-xs text-neutral-500">
                        {ex.muscles.map((m) => m.muscle).join(', ')}
                      </span>
                    </span>
                    <span className="text-brand-400">+</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
