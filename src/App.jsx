import { NavLink, Route, Routes, Navigate } from 'react-router-dom';
import WorkoutLogger from './components/WorkoutLogger.jsx';
import WorkoutHistory from './components/WorkoutHistory.jsx';
import ExerciseLibrary from './components/ExerciseLibrary.jsx';
import MuscleCoverage from './components/MuscleCoverage.jsx';
import Settings from './components/Settings.jsx';

const TABS = [
  { to: '/', label: 'Log', icon: '🏋️', end: true },
  { to: '/history', label: 'History', icon: '📈' },
  { to: '/exercises', label: 'Exercises', icon: '📚' },
  { to: '/coverage', label: 'Coverage', icon: '🧍' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function App() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col">
      <header className="sticky top-0 z-20 border-b border-neutral-800 bg-neutral-950/85 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 shadow shadow-brand-950/60">
            <span aria-hidden className="text-base">🏋️</span>
          </span>
          <h1 className="text-lg font-bold tracking-tight text-neutral-50">Workout Tracker</h1>
        </div>
      </header>

      <main className="flex-1 px-4 pb-24 pt-4">
        <Routes>
          <Route path="/" element={<WorkoutLogger />} />
          <Route path="/history" element={<WorkoutHistory />} />
          <Route path="/exercises" element={<ExerciseLibrary />} />
          <Route path="/coverage" element={<MuscleCoverage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <nav className="fixed bottom-0 left-1/2 z-20 flex w-full max-w-2xl -translate-x-1/2 border-t border-neutral-800 bg-neutral-950/90 backdrop-blur">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) => `tab-link ${isActive ? 'active' : ''}`}
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
