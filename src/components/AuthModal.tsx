import React, { useState } from 'react';
import { User } from '../types';
import { NoorLogo } from './NoorLogo';
import { Lock, Mail, User as UserIcon, Phone, Eye, EyeOff, Sparkles, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { INITIAL_USERS } from '../utils/storage';

interface AuthModalProps {
  currentUser: User;
  onSelectUser: (user: User) => void;
  onRegisterNewUser: (user: User) => void;
  onClose?: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  currentUser,
  onSelectUser,
  onRegisterNewUser,
  onClose,
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'switch'>('switch');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [bio, setBio] = useState('✨ Spreading light & joy on Noor Chat');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !email.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    const cleanUsername = username.replace(/^@/, '').toLowerCase().trim();
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      username: cleanUsername,
      email: email.trim(),
      phone: phone.trim() || '+1 (555) 000-0000',
      avatar: selectedAvatar,
      bio: bio.trim(),
      online: true,
    };

    onRegisterNewUser(newUser);
    setSuccess('Registration successful! Welcome to Noor Chat.');
    setTimeout(() => {
      if (onClose) onClose();
    }, 800);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email or username');
      return;
    }
    const matched = INITIAL_USERS.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() ||
        u.username.toLowerCase() === email.replace(/^@/, '').toLowerCase()
    );
    if (matched) {
      onSelectUser(matched);
      setSuccess(`Signed in as ${matched.name}!`);
      setTimeout(() => {
        if (onClose) onClose();
      }, 500);
    } else {
      // Auto-create session with this email
      const newUser: User = {
        id: `user_${Date.now()}`,
        name: email.split('@')[0],
        username: email.split('@')[0].toLowerCase(),
        email: email.includes('@') ? email : `${email}@noor.app`,
        avatar: PRESET_AVATARS[0],
        bio: 'Noor Chat Explorer',
        online: true,
      };
      onRegisterNewUser(newUser);
      if (onClose) onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-emerald-500/30 p-6 shadow-2xl text-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header with Custom Logo */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <NoorLogo size="md" />
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
            >
              Close
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1 my-4 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold">
          <button
            id="tab-switch-user"
            onClick={() => {
              setTab('switch');
              setError('');
            }}
            className={`py-2 rounded-lg transition-all ${
              tab === 'switch'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Quick Switch
          </button>
          <button
            id="tab-login"
            onClick={() => {
              setTab('login');
              setError('');
            }}
            className={`py-2 rounded-lg transition-all ${
              tab === 'login'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            id="tab-register"
            onClick={() => {
              setTab('register');
              setError('');
            }}
            className={`py-2 rounded-lg transition-all ${
              tab === 'register'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error / Success Feedback */}
        {error && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Tab 1: Fast Account Switcher (For real multi-user live messaging testing) */}
        {tab === 'switch' && (
          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-200 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Multi-Account Instant Switcher</p>
                <p className="text-emerald-300/80 mt-0.5">
                  Select an account to simulate real 1-to-1 chat between users. When Noor sends a message to Sarah, switch to Sarah to reply!
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {INITIAL_USERS.slice(0, 5).map((user) => {
                const isSelected = currentUser.id === user.id;
                return (
                  <button
                    key={user.id}
                    id={`btn-switch-${user.username}`}
                    onClick={() => {
                      onSelectUser(user);
                      if (onClose) onClose();
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-900/40 border-emerald-500/60 ring-1 ring-emerald-400'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700"
                        />
                        {user.online && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-sm text-white">{user.name}</span>
                          {isSelected && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">@{user.username} • {user.email}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Standard Sign In */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="flex-1 overflow-y-auto space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email or Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="noorking47470@gmail.com or noorking"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="btn-submit-login"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-950/40 transition cursor-pointer"
            >
              Sign In to Noor Chat
            </button>
          </form>
        )}

        {/* Tab 3: User Registration */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {/* Avatar Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Choose Profile Avatar
              </label>
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {PRESET_AVATARS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`relative shrink-0 rounded-full transition-transform ${
                      selectedAvatar === av
                        ? 'ring-2 ring-emerald-400 scale-105'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={av}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {selectedAvatar === av && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center text-[8px] text-white">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Noor Khan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Username *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">@</span>
                  <input
                    type="text"
                    required
                    placeholder="noor_dev"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="noor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    placeholder="+1 555 1234"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Status Bio
              </label>
              <input
                type="text"
                placeholder="Status / bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              id="btn-submit-register"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/40 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Create Account & Join Noor Chat
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
