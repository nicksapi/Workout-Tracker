const WIDTH = 320;
const HEIGHT = 140;
const PAD = { top: 12, right: 12, bottom: 24, left: 36 };

export default function TrendChart({ points, label }) {
  const values = points.map((p) => p.value).filter((v) => v != null);
  if (values.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-400">No data yet.</p>;
  }

  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const range = max - min || 1;
  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;

  const xFor = (i) => PAD.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const yFor = (v) => PAD.top + innerH - ((v - min) / range) * innerH;

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i).toFixed(1)} ${yFor(p.value).toFixed(1)}`)
    .join(' ');

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label={label}>
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={HEIGHT - PAD.bottom} stroke="#e2e8f0" />
      <line
        x1={PAD.left}
        y1={HEIGHT - PAD.bottom}
        x2={WIDTH - PAD.right}
        y2={HEIGHT - PAD.bottom}
        stroke="#e2e8f0"
      />
      <text x={4} y={PAD.top + 4} fontSize="9" fill="#94a3b8">
        {max.toFixed(0)}
      </text>
      <text x={4} y={HEIGHT - PAD.bottom} fontSize="9" fill="#94a3b8">
        {min.toFixed(0)}
      </text>
      <path d={linePath} fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={i} cx={xFor(i)} cy={yFor(p.value)} r="2.5" fill="#0ea5e9" />
      ))}
      {points.length > 1 && (
        <>
          <text x={PAD.left} y={HEIGHT - 6} fontSize="9" fill="#94a3b8">
            {points[0].dateLabel}
          </text>
          <text x={WIDTH - PAD.right} y={HEIGHT - 6} fontSize="9" fill="#94a3b8" textAnchor="end">
            {points[points.length - 1].dateLabel}
          </text>
        </>
      )}
    </svg>
  );
}
