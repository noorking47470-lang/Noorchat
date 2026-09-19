import React from 'react';
import { PollData, User } from '../types';
import { BarChart2, CheckCircle2, Circle, CheckSquare, Square, Users } from 'lucide-react';

interface PollCardProps {
  poll: PollData;
  currentUser: User;
  allUsers: User[];
  onVote: (optionId: string) => void;
}

export const PollCard: React.FC<PollCardProps> = ({
  poll,
  currentUser,
  allUsers,
  onVote,
}) => {
  // Calculate total votes across options
  const totalVotesCount = poll.options.reduce((acc, opt) => acc + opt.voterIds.length, 0);

  // Helper to find voter profile details
  const getVoterUsers = (voterIds: string[]): User[] => {
    return voterIds
      .map((id) => allUsers.find((u) => u.id === id))
      .filter((u): u is User => u !== undefined);
  };

  return (
    <div className="w-full min-w-[240px] sm:min-w-[280px] p-3.5 rounded-2xl bg-slate-900/95 border border-emerald-500/30 text-slate-100 shadow-xl select-none">
      {/* Poll Header */}
      <div className="flex items-start justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Group Poll
            </span>
            <p className="text-xs sm:text-sm font-bold text-white leading-snug">
              {poll.question}
            </p>
          </div>
        </div>
      </div>

      {/* Options List */}
      <div className="space-y-2.5">
        {poll.options.map((option) => {
          const hasVoted = option.voterIds.includes(currentUser.id);
          const voteCount = option.voterIds.length;
          const percentage =
            totalVotesCount > 0 ? Math.round((voteCount / totalVotesCount) * 100) : 0;
          const voters = getVoterUsers(option.voterIds);

          return (
            <div
              key={option.id}
              onClick={() => onVote(option.id)}
              className={`relative overflow-hidden p-2.5 rounded-xl border transition-all cursor-pointer ${
                hasVoted
                  ? 'border-emerald-500/80 bg-emerald-950/40 shadow-sm'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
              }`}
            >
              {/* Animated Progress Bar Fill */}
              <div
                className={`absolute top-0 bottom-0 left-0 transition-all duration-500 ${
                  hasVoted
                    ? 'bg-gradient-to-r from-emerald-600/30 to-teal-500/30'
                    : 'bg-slate-800/40'
                }`}
                style={{ width: `${percentage}%` }}
              />

              {/* Content on top of progress bar */}
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Checkbox or Radio Icon */}
                    {poll.allowMultipleAnswers ? (
                      hasVoted ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500 shrink-0" />
                      )
                    ) : hasVoted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                    )}

                    <span
                      className={`text-xs font-semibold truncate ${
                        hasVoted ? 'text-white' : 'text-slate-200'
                      }`}
                    >
                      {option.text}
                    </span>
                  </div>

                  {/* Percentage & Count Badge */}
                  <div className="flex items-center gap-1.5 shrink-0 text-right">
                    <span className="text-xs font-mono font-bold text-white">
                      {percentage}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      ({voteCount})
                    </span>
                  </div>
                </div>

                {/* Voters Avatar Stack */}
                {voters.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2 pt-1 border-t border-slate-800/60">
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {voters.slice(0, 5).map((voter) => (
                        <img
                          key={voter.id}
                          src={voter.avatar}
                          alt={voter.name}
                          title={voter.name}
                          className="inline-block w-4 h-4 rounded-full ring-1 ring-slate-900 object-cover"
                        />
                      ))}
                    </div>
                    {voters.length > 5 && (
                      <span className="text-[9px] text-slate-400 font-medium">
                        +{voters.length - 5}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 truncate">
                      {voters.map((v) => (v.id === currentUser.id ? 'You' : v.name.split(' ')[0])).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Poll Footer */}
      <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-800 text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3 text-emerald-400" />
          <span>{totalVotesCount} vote{totalVotesCount !== 1 ? 's' : ''} total</span>
        </span>
        <span className="text-emerald-400/90 font-medium">
          {poll.allowMultipleAnswers ? 'Multiple choice' : 'Single choice'} • Tap to vote
        </span>
      </div>
    </div>
  );
};
