import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api.js';
import { downloadBackup, importData, readBackupFile } from '../lib/backup.js';

export default function Settings() {
  const [stats, setStats] = useState(null);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text }
  const fileInputRef = useRef(null);

  async function refreshStats() {
    const [exercises, workouts, templates] = await Promise.all([
      api.listExercises(),
      api.listWorkouts({ limit: 1000 }),
      api.listTemplates(),
    ]);
    setStats({
      exercises: exercises.length,
      custom: exercises.filter((e) => e.is_custom).length,
      workouts: workouts.length,
      templates: templates.length,
    });
  }

  useEffect(() => {
    refreshStats();
  }, []);

  async function handleExport() {
    setMessage(null);
    try {
      await downloadBackup();
      setMessage({ type: 'success', text: 'Backup downloaded. Save that file somewhere safe (e.g. cloud storage) so you can restore it on a new phone.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!confirm('Importing will replace ALL current data on this device with the contents of the backup file. Continue?')) {
      return;
    }

    setImporting(true);
    setMessage(null);
    try {
      const data = await readBackupFile(file);
      await importData(data);
      await refreshStats();
      setMessage({ type: 'success', text: 'Backup restored successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-neutral-50">Settings</h2>

      <div className="card space-y-3">
        <h3 className="font-semibold text-neutral-50">Your data</h3>
        <p className="text-sm text-neutral-400">
          Everything is stored only in this browser on this device — there's no account and nothing is sent to a
          server.
        </p>
        {stats && (
          <ul className="grid grid-cols-2 gap-2 text-sm text-neutral-300">
            <li>{stats.exercises} exercises ({stats.custom} custom)</li>
            <li>{stats.workouts} workouts logged</li>
            <li>{stats.templates} templates</li>
          </ul>
        )}
      </div>

      {message && (
        <p
          className={`rounded-md px-3 py-2 text-sm ${message.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}
        >
          {message.text}
        </p>
      )}

      <div className="card space-y-2">
        <h3 className="font-semibold text-neutral-50">Back up</h3>
        <p className="text-sm text-neutral-400">
          Download everything as a JSON file. Do this before switching phones, or just periodically as a safety net.
        </p>
        <button className="btn-primary w-full" onClick={handleExport}>
          Export backup
        </button>
      </div>

      <div className="card space-y-2">
        <h3 className="font-semibold text-neutral-50">Restore</h3>
        <p className="text-sm text-neutral-400">
          On a new phone (or after clearing browser data), pick a previously exported backup file to restore
          everything. This replaces whatever is currently on this device.
        </p>
        <button className="btn-secondary w-full" onClick={handleImportClick} disabled={importing}>
          {importing ? 'Restoring…' : 'Import backup'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleFileSelected}
        />
      </div>
    </div>
  );
}
