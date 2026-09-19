import React, { useState } from 'react';
import { User } from '../types';
import { Search, UserPlus, MessageSquare, Phone, Video, X, Check, Sparkles } from 'lucide-react';

interface FriendsListProps {
  currentUser: User;
  users: User[];
  onStartChat: (user: User) => void;
  onStartCall: (user: User, type: 'audio' | 'video') => void;
  onAddFriend: (newFriend: User) => void;
}

export const FriendsList: React.FC<FriendsListProps> = ({
  currentUser,
  users,
  onStartChat,
  onStartCall,
  onAddFriend,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFriendName, setNewFriendName] = useState('');
  const [newFriendUsername, setNewFriendUsername] = useState('');
  const [newFriendPhone, setNewFriendPhone] = useState('');
  const [addFeedback, setAddFeedback] = useState('');

  const friends = users.filter((u) => u.id !== currentUser.id);

  const filteredFriends = friends.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendName.trim() || !newFriendUsername.trim()) return;

    const cleanUsername = newFriendUsername.replace(/^@/, '').toLowerCase().trim();
    const newFriend: User = {
      id: `user_${Date.now()}`,
      name: newFriendName.trim(),
      username: cleanUsername,
      email: `${cleanUsername}@noor.app`,
      phone: newFriendPhone.trim() || '+1 (555) 777-8888',
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 50000000)}?w=150&auto=format&fit=crop&q=80`,
      bio: 'New friend on Noor Chat! ✨',
      online: true,
    };

    onAddFriend(newFriend);
    setAddFeedback(`Added ${newFriend.name} to your friends list!`);
    setTimeout(() => {
      setNewFriendName('');
      setNewFriendUsername('');
      setNewFriendPhone('');
      setAddFeedback('');
      setShowAddModal(false);
    }, 900);
  };

  return (
    <div className="relative flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Top Search & Add Contact Button */}
      <div className="px-4 py-2 bg-slate-950/80 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            id="input-search-friends"
            placeholder="Search friends by name or @username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>
        <button
          id="btn-open-add-friend"
          onClick={() => setShowAddModal(true)}
          className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition cursor-pointer shrink-0"
          title="Add New Friend"
        >
          <UserPlus className="w-4 h-4" />
        </button>
      </div>

      {/* Friends Count Banner */}
      <div className="px-4 py-1.5 text-[11px] font-semibold text-slate-400 flex items-center justify-between border-b border-slate-900/80">
        <span>{filteredFriends.length} Noor Contacts</span>
        <span className="text-emerald-400">
          {filteredFriends.filter((f) => f.online).length} Online Now
        </span>
      </div>

      {/* Friends Scrollable List */}
      <div className="flex-1 overflow-y-auto px-2 divide-y divide-slate-900/60">
        {filteredFriends.map((friend) => (
          <div
            key={friend.id}
            id={`friend-item-${friend.username}`}
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-900/60 transition"
          >
            <div
              className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
              onClick={() => onStartChat(friend)}
            >
              <div className="relative shrink-0">
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className="w-11 h-11 rounded-full object-cover border border-slate-800"
                />
                {friend.online ? (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
                ) : (
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-slate-500 ring-2 ring-slate-950" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm text-white truncate">{friend.name}</span>
                  <span className="text-[10px] text-slate-500">@{friend.username}</span>
                </div>
                <p className="text-xs text-slate-400 truncate">{friend.bio || 'Available'}</p>
              </div>
            </div>

            {/* Quick Actions: Chat, Audio Call, Video Call */}
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <button
                id={`btn-chat-friend-${friend.username}`}
                onClick={() => onStartChat(friend)}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Send Message"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
              </button>
              <button
                id={`btn-audio-friend-${friend.username}`}
                onClick={() => onStartCall(friend, 'audio')}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Voice Call"
              >
                <Phone className="w-4 h-4 text-teal-400" />
              </button>
              <button
                id={`btn-video-friend-${friend.username}`}
                onClick={() => onStartCall(friend, 'video')}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Video Call"
              >
                <Video className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>
        ))}

        {filteredFriends.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-xs">
            No contacts found for &quot;{searchQuery}&quot;
          </div>
        )}
      </div>

      {/* Add Friend Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-emerald-500/30 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Add New Friend</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addFeedback ? (
              <div className="my-6 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{addFeedback}</span>
              </div>
            ) : (
              <form onSubmit={handleAddSubmit} className="space-y-3.5 my-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Youssef Karim"
                    value={newFriendName}
                    onChange={(e) => setNewFriendName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Noor Username *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-slate-500 font-bold">@</span>
                    <input
                      type="text"
                      required
                      placeholder="youssef_k"
                      value={newFriendUsername}
                      onChange={(e) => setNewFriendUsername(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 444-5555"
                    value={newFriendPhone}
                    onChange={(e) => setNewFriendPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  id="btn-confirm-add-friend"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/40 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Add to Noor Contacts
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
