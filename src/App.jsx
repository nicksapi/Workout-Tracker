import { NavLink, Route, Routes, Navigate } from 'react-router-dom';
import WorkoutLogger from './components/WorkoutLogger.jsx';
import WorkoutHistory from './components/WorkoutHistory.jsx';
import ExerciseLibrary from './components/ExerciseLibrary.jsx';
import RoutineBuilder from './components/RoutineBuilder.jsx';
import MuscleCoverage from './components/MuscleCoverage.jsx';

const TABS = [
  { to: '/', label: 'Log', icon: '🏋️', end: true },
  { to: '/history', label: 'History', icon: '📈' },
  { to: '/exercises', label: 'Exercises', icon: '📚' },
  { to: '/routine', label: 'Routine', icon: '🗓️' },
  { to: '/coverage', label: 'Coverage', icon: '🧍' },
];

export default function App() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
        <h1 className="text-lg font-bold text-slate-900">Workout Tracker</h1>
      </header>

      <main className="flex-1 px-4 pb-24 pt-4">
        <Routes>
          <Route path="/" element={<WorkoutLogger />} />
          <Route path="/history" element={<WorkoutHistory />} />
          <Route path="/exercises" element={<ExerciseLibrary />} />
          <Route path="/routine" element={<RoutineBuilder />} />
          <Route path="/coverage" element={<MuscleCoverage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <nav className="fixed bottom-0 left-1/2 z-20 flex w-full max-w-2xl -translate-x-1/2 border-t border-slate-200 bg-white/95 backdrop-blur">
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
