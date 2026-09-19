import React, { useState } from 'react';
import { X, Plus, Trash2, BarChart2, CheckCircle2, HelpCircle } from 'lucide-react';
import { PollData } from '../types';

interface CreatePollModalProps {
  onClose: () => void;
  onCreatePoll: (poll: Omit<PollData, 'id' | 'totalVotes'>) => void;
}

const POLL_TEMPLATES = [
  {
    question: 'When should we hold the next Noor Chat sync?',
    options: ['Today at 5:00 PM', 'Tomorrow at 10:00 AM', 'This Friday at 3:00 PM'],
  },
  {
    question: 'Which theme preference for the Android APK build?',
    options: ['Emerald & Twilight (Current)', 'Midnight Obsidian', 'Sapphire Blue'],
  },
  {
    question: 'Top priority feature for next release?',
    options: ['Live Location Sharing', 'Disappearing Messages', 'Group Audio Rooms'],
  },
];

export const CreatePollModal: React.FC<CreatePollModalProps> = ({
  onClose,
  onCreatePoll,
}) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [allowMultipleAnswers, setAllowMultipleAnswers] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
    if (errorMsg) setErrorMsg('');
  };

  const handleAddOption = () => {
    if (options.length >= 8) {
      setErrorMsg('Maximum 8 options allowed per poll.');
      return;
    }
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      setErrorMsg('A poll must have at least 2 options.');
      return;
    }
    const updated = options.filter((_, i) => i !== index);
    setOptions(updated);
  };

  const handleApplyTemplate = (template: { question: string; options: string[] }) => {
    setQuestion(template.question);
    setOptions([...template.options]);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      setErrorMsg('Please enter a poll question.');
      return;
    }

    const cleanOptions = options.map((opt) => opt.trim()).filter((opt) => opt.length > 0);
    if (cleanOptions.length < 2) {
      setErrorMsg('Please provide at least 2 non-empty options.');
      return;
    }

    // Check duplicates
    const uniqueOptions = new Set(cleanOptions.map((o) => o.toLowerCase()));
    if (uniqueOptions.size !== cleanOptions.length) {
      setErrorMsg('Poll options must be unique.');
      return;
    }

    onCreatePoll({
      question: question.trim(),
      options: cleanOptions.map((optText, index) => ({
        id: `opt_${Date.now()}_${index}`,
        text: optText,
        voterIds: [],
      })),
      allowMultipleAnswers,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-emerald-500/40 p-5 sm:p-6 shadow-2xl text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create Group Poll</h3>
              <p className="text-[11px] text-slate-400">Collect votes from all 10 members</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Templates */}
        <div className="my-3 shrink-0">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
            Quick Suggestions:
          </span>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {POLL_TEMPLATES.map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleApplyTemplate(tpl)}
                className="shrink-0 px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/40 text-[10px] text-slate-300 hover:text-emerald-300 transition cursor-pointer"
              >
                {tpl.question.length > 25 ? `${tpl.question.substring(0, 25)}...` : tpl.question}
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Question */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Poll Question *
            </label>
            <input
              type="text"
              id="input-poll-question"
              placeholder="e.g. Which time works best for you?"
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              autoFocus
            />
          </div>

          {/* Options */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-200">
                Options ({options.length}/8) *
              </label>
              <span className="text-[10px] text-slate-500">Min 2 options</span>
            </div>

            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-5 text-center text-xs font-bold text-slate-500">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    id={`input-poll-option-${index}`}
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Remove option"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 8 && (
              <button
                type="button"
                id="btn-add-poll-option"
                onClick={handleAddOption}
                className="mt-2.5 w-full py-2 rounded-xl border border-dashed border-emerald-500/40 hover:border-emerald-500/80 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Option
              </button>
            )}
          </div>

          {/* Poll Settings */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white block">
                  Allow multiple answers
                </span>
                <span className="text-[10px] text-slate-400">
                  Members can select more than one option
                </span>
              </div>
              <button
                type="button"
                id="toggle-multiple-answers"
                onClick={() => setAllowMultipleAnswers(!allowMultipleAnswers)}
                className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                  allowMultipleAnswers ? 'bg-emerald-600' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    allowMultipleAnswers ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Error message */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              id="btn-submit-create-poll"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/40 transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
            >
              <BarChart2 className="w-4 h-4" />
              Send Poll to Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
