import React from 'react';
import { CallRecord, User } from '../types';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, Trash2 } from 'lucide-react';

interface CallsHistoryProps {
  calls: CallRecord[];
  onStartCall: (peer: User, type: 'audio' | 'video') => void;
  onClearHistory: () => void;
}

export const CallsHistory: React.FC<CallsHistoryProps> = ({
  calls,
  onStartCall,
  onClearHistory,
}) => {
  const formatDuration = (secs: number) => {
    if (secs === 0) return 'Missed';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Header bar */}
      <div className="px-4 py-2 bg-slate-950/80 flex items-center justify-between border-b border-slate-900">
        <span className="text-xs font-semibold text-slate-400">Recent Call Logs</span>
        {calls.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center gap-1 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Calls List */}
      <div className="flex-1 overflow-y-auto px-2 divide-y divide-slate-900/60">
        {calls.map((call) => {
          const isMissed = call.direction === 'missed';

          return (
            <div
              key={call.id}
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-900/60 transition"
            >
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img
                    src={call.peer.avatar}
                    alt={call.peer.name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-800"
                  />
                  <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-slate-900 border border-slate-800">
                    {call.type === 'video' ? (
                      <Video className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Phone className="w-3 h-3 text-teal-400" />
                    )}
                  </div>
                </div>

                <div>
                  <h4
                    className={`text-sm font-semibold ${
                      isMissed ? 'text-rose-400' : 'text-white'
                    }`}
                  >
                    {call.peer.name}
                  </h4>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                    {call.direction === 'incoming' && (
                      <PhoneIncoming className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    {call.direction === 'outgoing' && (
                      <PhoneOutgoing className="w-3.5 h-3.5 text-teal-400" />
                    )}
                    {call.direction === 'missed' && (
                      <PhoneMissed className="w-3.5 h-3.5 text-rose-400" />
                    )}
                    <span>{formatDuration(call.durationSeconds)}</span>
                    <span>•</span>
                    <span className="text-[10px] text-slate-500">
                      {formatTimestamp(call.timestamp)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Redial Action */}
              <button
                onClick={() => onStartCall(call.peer, call.type)}
                className="p-2.5 rounded-full hover:bg-slate-800 text-emerald-400 transition"
                title={`Call ${call.peer.name}`}
              >
                {call.type === 'video' ? (
                  <Video className="w-4 h-4" />
                ) : (
                  <Phone className="w-4 h-4" />
                )}
              </button>
            </div>
          );
        })}

        {calls.length === 0 && (
          <div className="text-center py-16 text-slate-500 text-xs">
            No call logs recorded yet
          </div>
        )}
      </div>
    </div>
  );
};
