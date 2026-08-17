import { FRONT_SHAPES, BACK_SHAPES } from '../lib/bodyMapData.js';
import { coverageColor } from '../lib/coverageColor.js';

export default function BodyMap({ view, coverageByMuscle }) {
  const shapes = view === 'back' ? BACK_SHAPES : FRONT_SHAPES;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 290" className="w-full max-w-[180px]">
        {shapes.map((s, i) => {
          const entry = s.muscle ? coverageByMuscle.get(s.muscle) : null;
          const fill = s.muscle ? coverageColor(entry?.percentage || 0) : '#cbd5e1';
          const title = s.muscle ? `${s.muscle}: ${(entry?.percentage || 0).toFixed(1)}%` : undefined;
          const common = { fill, stroke: '#ffffff', strokeWidth: 1.5 };

          let el;
          if (s.shape === 'circle') {
            el = <circle cx={s.cx} cy={s.cy} r={s.r} {...common} />;
          } else if (s.shape === 'ellipse') {
            el = <ellipse cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} {...common} />;
          } else if (s.shape === 'polygon') {
            el = <polygon points={s.points} {...common} />;
          } else {
            el = <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx} {...common} />;
          }

          return (
            <g key={i}>
              {el}
              {title && <title>{title}</title>}
            </g>
          );
        })}
      </svg>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{view}</p>
    </div>
  );
}
