import React, { useState } from 'react';
import { User, Message, Group } from '../types';
import { Search, MessageSquarePlus, Users, CheckCheck, Check, Sparkles } from 'lucide-react';

interface ChatListProps {
  currentUser: User;
  users: User[];
  messages: Message[];
  group: Group;
  onSelectChat: (peer: User) => void;
  onSelectGroup: () => void;
  onNewChat: () => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  currentUser,
  users,
  messages,
  group,
  onSelectChat,
  onSelectGroup,
  onNewChat,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Get other users (friends)
  const otherUsers = users.filter((u) => u.id !== currentUser.id);

  // Calculate last message & unread counts for each contact
  const chatThreads = otherUsers.map((peer) => {
    const threadMessages = messages.filter(
      (m) =>
        (m.senderId === currentUser.id && m.recipientId === peer.id) ||
        (m.senderId === peer.id && m.recipientId === currentUser.id)
    );
    const lastMsg = threadMessages[threadMessages.length - 1];
    const unreadCount = threadMessages.filter(
      (m) => m.senderId === peer.id && m.status !== 'read'
    ).length;

    return {
      peer,
      lastMessage: lastMsg,
      unreadCount,
    };
  });

  // Calculate group last message
  const groupMessages = messages.filter((m) => m.groupId === group.id);
  const lastGroupMsg = groupMessages[groupMessages.length - 1];

  // Filter threads by search query
  const filteredThreads = chatThreads.filter(
    (t) =>
      t.peer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.peer.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const renderMessageSnippet = (msg?: Message) => {
    if (!msg) return 'No messages yet';
    if (msg.type === 'image') return '📷 Photo';
    if (msg.type === 'audio') return '🎙️ Voice note';
    if (msg.type === 'file') return `📎 ${msg.mediaName || 'Document'}`;
    if (msg.type === 'poll') return `📊 Poll: ${msg.poll?.question || msg.content}`;
    return msg.content;
  };

  return (
    <div className="relative flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Search Bar */}
      <div className="px-4 py-2 bg-slate-950/80">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            id="input-search-chats"
            placeholder="Search chats, contacts, or messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 divide-y divide-slate-900/60">
        {/* Featured Private Group (Strict 10 Members) */}
        {(!searchQuery || group.name.toLowerCase().includes(searchQuery.toLowerCase())) && (
          <div
            id="item-group-chat"
            onClick={onSelectGroup}
            className="flex items-center gap-3 p-3 my-1 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/40 to-teal-950/30 border border-emerald-500/20 hover:border-emerald-500/40 transition-all cursor-pointer group"
          >
            <div className="relative shrink-0">
              <img
                src={group.avatar}
                alt={group.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/50"
              />
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-emerald-600 text-[9px] font-bold text-white shadow ring-2 ring-slate-950">
                10/10
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-semibold text-sm text-white truncate flex items-center gap-1.5">
                  <span className="truncate">{group.name}</span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold uppercase shrink-0">
                    VIP 10
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {formatTime(lastGroupMsg?.timestamp || group.createdAt)}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate flex items-center gap-1">
                <span className="text-emerald-400 font-semibold shrink-0">
                  {lastGroupMsg ? `${lastGroupMsg.senderName.split(' ')[0]}: ` : 'Group: '}
                </span>
                <span className="truncate">{renderMessageSnippet(lastGroupMsg)}</span>
              </p>
            </div>
          </div>
        )}

        {/* 1-to-1 Chat Threads */}
        {filteredThreads.map(({ peer, lastMessage, unreadCount }) => {
          const isMe = lastMessage?.senderId === currentUser.id;

          return (
            <div
              key={peer.id}
              id={`chat-thread-${peer.username}`}
              onClick={() => onSelectChat(peer)}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-900/80 transition-colors cursor-pointer"
            >
              {/* Avatar + Online Indicator */}
              <div className="relative shrink-0">
                <img
                  src={peer.avatar}
                  alt={peer.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-800"
                />
                {peer.online ? (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
                ) : (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-slate-500 ring-2 ring-slate-950" />
                )}
              </div>

              {/* Chat Thread Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-semibold text-sm text-white truncate">
                    {peer.name}
                  </span>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {formatTime(lastMessage?.timestamp)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400 truncate flex items-center gap-1">
                    {isMe && (
                      <span className="shrink-0">
                        {lastMessage?.status === 'read' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-amber-300 inline" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-slate-400 inline" />
                        )}
                      </span>
                    )}
                    <span className="truncate">{renderMessageSnippet(lastMessage)}</span>
                  </p>

                  {/* Unread Counter Badge */}
                  {unreadCount > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-extrabold shadow-sm shrink-0">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredThreads.length === 0 && (
          <div className="text-center py-10 px-4 text-slate-500 text-xs">
            No conversations found for &quot;{searchQuery}&quot;
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) for New Chat */}
      <button
        id="btn-fab-new-chat"
        onClick={onNewChat}
        className="absolute bottom-4 right-4 w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-xl shadow-emerald-950/60 flex items-center justify-center transition active:scale-95 cursor-pointer z-30"
        title="Start New Chat"
      >
        <MessageSquarePlus className="w-6 h-6" />
      </button>
    </div>
  );
};
