"use client";
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function NotificationsToggle() {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    try { setEnabled(localStorage.getItem('frenzy_push_enabled') === '1'); } catch {}
  }, []);

  async function onToggle(v: boolean) {
    // Web Push is currently disabled in this build; keep UI inert
    toast('Push notifications are coming soon');
    return;
  }

  return (
    <div className="mt-3 flex items-center justify-between bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 rounded p-3 text-sm">
      <span className="text-gray-700 dark:text-gray-300">Enable Web Push</span>
      <input
        type="checkbox"
        disabled
        aria-disabled="true"
        title="Coming soon"
        checked={enabled}
        onChange={e=>onToggle(e.target.checked)}
        className="h-4 w-4 dark:accent-gray-600"
      />
    </div>
  );
}
