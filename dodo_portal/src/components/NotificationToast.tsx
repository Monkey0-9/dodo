import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import type { Notification } from '../store/appStore';

const levelStyle: Record<Notification['level'], { bg: string; border: string; icon: string; iconColor: string }> = {
  info:    { bg: 'bg-surface-container-high',   border: 'border-primary/40',  icon: 'info',           iconColor: 'text-primary' },
  success: { bg: 'bg-surface-container-high',   border: 'border-emerald-500/40', icon: 'check_circle', iconColor: 'text-emerald-400' },
  warning: { bg: 'bg-surface-container-high',   border: 'border-yellow-500/40',  icon: 'warning',       iconColor: 'text-yellow-400' },
  error:   { bg: 'bg-surface-container-highest', border: 'border-error/50',     icon: 'error',           iconColor: 'text-error' },
};

/**
 * NotificationToast — renders a stacked, auto-dismissing notification shelf
 * in the bottom-right corner. Driven by the Zustand appStore.
 */
export const NotificationToast = () => {
  const notifications = useAppStore((s) => s.notifications);
  const dismiss = useAppStore((s) => s.dismissNotification);

  // Auto-dismiss after 5 s
  useEffect(() => {
    if (notifications.length === 0) return;
    const oldest = notifications[0];
    const remaining = 5000 - (Date.now() - oldest.ts);
    const timer = setTimeout(() => dismiss(oldest.id), Math.max(remaining, 0));
    return () => clearTimeout(timer);
  }, [notifications, dismiss]);

  if (notifications.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none"
      style={{ maxWidth: '360px' }}
    >
      {notifications.map((n) => {
        const s = levelStyle[n.level];
        return (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md ${s.bg} ${s.border} 
              animate-in slide-in-from-right-4 fade-in duration-300`}
          >
            <span className={`material-symbols-outlined text-xl shrink-0 mt-0.5 ${s.iconColor}`}>
              {s.icon}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-xs font-bold uppercase tracking-widest text-on-surface">{n.title}</p>
              {n.message && (
                <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{n.message}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(n.id)}
              className="shrink-0 text-on-surface-variant hover:text-on-surface transition-colors"
              aria-label="Dismiss notification"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
