import React, { useEffect } from 'react';
import { AppNotification } from '../types';
import { MessageSquare, X } from 'lucide-react';

interface NotificationsBannerProps {
  notification: AppNotification | null;
  onOpenNotification: (notification: AppNotification) => void;
  onDismiss: () => void;
}

export const NotificationsBanner: React.FC<NotificationsBannerProps> = ({
  notification,
  onOpenNotification,
  onDismiss,
}) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 4500);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  return (
    <div className="absolute top-11 left-3 right-3 z-50 animate-slideDown select-none">
      <div
        onClick={() => onOpenNotification(notification)}
        className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-emerald-500/40 shadow-2xl shadow-emerald-950/60 cursor-pointer hover:bg-slate-850 transition"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            {notification.avatar ? (
              <img
                src={notification.avatar}
                alt="sender"
                className="w-10 h-10 rounded-full object-cover ring-1 ring-emerald-500/40"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                <MessageSquare className="w-5 h-5" />
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] text-white">
              💬
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-white truncate">
                {notification.title}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase">
                Noor
              </span>
            </div>
            <p className="text-xs text-slate-300 truncate mt-0.5">{notification.body}</p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="p-1 rounded-full text-slate-400 hover:text-white shrink-0 ml-2"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
