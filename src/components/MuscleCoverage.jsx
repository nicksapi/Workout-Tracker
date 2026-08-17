import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import BodyMap from './BodyMap.jsx';
import { coverageColor } from '../lib/coverageColor.js';

export default function MuscleCoverage() {
  const [days, setDays] = useState(7);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .getCoverage(days)
      .then(setData)
      .finally(() => setLoading(false));
  }, [days]);

  const coverageByMuscle = new Map((data?.coverage || []).map((c) => [c.muscle, c]));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-50">Muscle Coverage</h2>
        <div className="flex rounded-lg bg-neutral-800 p-1">
          {[7, 30].map((d) => (
            <button
              key={d}
              className={`rounded-md px-3 py-1 text-sm font-medium ${days === d ? 'bg-neutral-700 text-brand-400 shadow-sm' : 'text-neutral-400'}`}
              onClick={() => setDays(d)}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-neutral-500">Loading…</p>
      ) : data.total_weighted_sets === 0 ? (
        <p className="py-8 text-center text-sm text-neutral-500">
          No sets logged in the last {days} days. Log a workout to see coverage here.
        </p>
      ) : (
        <>
          <div className="card flex justify-around gap-4">
            <BodyMap view="front" coverageByMuscle={coverageByMuscle} />
            <BodyMap view="back" coverageByMuscle={coverageByMuscle} />
          </div>

          <div className="card space-y-2">
            <h3 className="font-semibold text-neutral-50">Breakdown (last {days} days)</h3>
            {data.coverage.map((c) => (
              <div key={c.muscle} className="flex items-center gap-2">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: coverageColor(c.percentage) }}
                />
                <span className="w-24 shrink-0 text-sm capitalize text-neutral-300">{c.muscle}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-800">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.min(100, c.percentage * 3)}%`, backgroundColor: coverageColor(c.percentage) }}
                  />
                </div>
                <span className="w-12 shrink-0 text-right text-sm font-medium text-neutral-300">
                  {c.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
            <p className="pt-1 text-xs text-neutral-500">
              Percentages are share of weighted sets (primary muscle = 1×, secondary = 0.5×) across all logged
              exercises in the window. Brighter orange means more relative volume.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
