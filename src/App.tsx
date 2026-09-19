import React, { useState, useEffect } from 'react';
import { User, Message, Group, CallRecord, CallType, AppNotification } from './types';
import {
  getStoredCurrentUser,
  setStoredCurrentUser,
  getStoredUsers,
  saveStoredUsers,
  getStoredMessages,
  saveStoredMessages,
  getStoredGroups,
  saveStoredGroups,
  getStoredCalls,
  saveStoredCalls,
} from './utils/storage';
import { playNotificationSound } from './utils/audio';
import { AndroidFrame } from './components/AndroidFrame';
import { NoorLogo } from './components/NoorLogo';
import { ChatList } from './components/ChatList';
import { ChatWindow } from './components/ChatWindow';
import { GroupChatWindow } from './components/GroupChatWindow';
import { CallScreen } from './components/CallScreen';
import { FriendsList } from './components/FriendsList';
import { CallsHistory } from './components/CallsHistory';
import { AuthModal } from './components/AuthModal';
import { NotificationsBanner } from './components/NotificationsBanner';
import { FirebaseGuideModal } from './components/FirebaseGuideModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  MessageSquare,
  Users,
  Phone,
  Contact,
  BookOpen,
  Sparkles,
  UserCheck,
  Shield,
} from 'lucide-react';

export default function App() {
  // App Core State
  const [currentUser, setCurrentUser] = useState<User>(getStoredCurrentUser());
  const [users, setUsers] = useState<User[]>(getStoredUsers());
  const [messages, setMessages] = useState<Message[]>(getStoredMessages());
  const [groups, setGroups] = useState<Group[]>(getStoredGroups());
  const [calls, setCalls] = useState<CallRecord[]>(getStoredCalls());

  // UI Navigation State
  const [activeTab, setActiveTab] = useState<'chats' | 'groups' | 'calls' | 'contacts'>('chats');
  const [activeChatPeer, setActiveChatPeer] = useState<User | null>(null);
  const [isGroupChatOpen, setIsGroupChatOpen] = useState(false);

  // Modals & Active Overlays
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFirebaseGuide, setShowFirebaseGuide] = useState(false);
  const [isDeviceMode, setIsDeviceMode] = useState(true);

  // Calls State
  const [activeCall, setActiveCall] = useState<{
    peer: User;
    type: CallType;
    isIncoming: boolean;
  } | null>(null);

  // Notifications State
  const [activeNotification, setActiveNotification] = useState<AppNotification | null>(null);

  // Sync to local storage
  useEffect(() => {
    setStoredCurrentUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    saveStoredUsers(users);
  }, [users]);

  useEffect(() => {
    saveStoredMessages(messages);
  }, [messages]);

  useEffect(() => {
    saveStoredGroups(groups);
  }, [groups]);

  useEffect(() => {
    saveStoredCalls(calls);
  }, [calls]);

  const primaryGroup = groups[0];

  // Send message handler (1-to-1 or group)
  const handleSendMessage = (msgData: Omit<Message, 'id' | 'timestamp' | 'status'>) => {
    const newMsg: Message = {
      ...msgData,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      status: 'read',
    };

    setMessages((prev) => [...prev, newMsg]);

    // If message is incoming to current user, trigger notification banner & sound
    if (newMsg.recipientId === currentUser.id && newMsg.senderId !== currentUser.id) {
      playNotificationSound();
      setActiveNotification({
        id: newMsg.id,
        title: newMsg.senderName,
        body: newMsg.type === 'image' ? '📷 Photo' : newMsg.type === 'audio' ? '🎙️ Voice message' : newMsg.content,
        avatar: newMsg.senderAvatar,
        chatId: newMsg.senderId,
        timestamp: Date.now(),
      });
    }
  };

  // Add message reaction
  const handleAddReaction = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === messageId) {
          const reactions = m.reactions || [];
          const existing = reactions.find((r) => r.userId === currentUser.id);
          if (existing) {
            return {
              ...m,
              reactions: reactions.map((r) =>
                r.userId === currentUser.id ? { ...r, emoji } : r
              ),
            };
          } else {
            return {
              ...m,
              reactions: [
                ...reactions,
                { emoji, userId: currentUser.id, userName: currentUser.name },
              ],
            };
          }
        }
        return m;
      })
    );
  };

  // Vote on a Poll in Group Chat
  const handleVotePoll = (messageId: string, optionId: string, voterId?: string) => {
    const effectiveVoterId = voterId || currentUser.id;

    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId || !msg.poll) return msg;

        const poll = msg.poll;
        const allowMultiple = poll.allowMultipleAnswers;

        const updatedOptions = poll.options.map((opt) => {
          const isTargetOption = opt.id === optionId;
          const hasVotedThis = opt.voterIds.includes(effectiveVoterId);

          if (isTargetOption) {
            if (hasVotedThis) {
              return {
                ...opt,
                voterIds: opt.voterIds.filter((id) => id !== effectiveVoterId),
              };
            } else {
              return {
                ...opt,
                voterIds: [...opt.voterIds, effectiveVoterId],
              };
            }
          } else {
            if (!allowMultiple && hasVotedThis) {
              return {
                ...opt,
                voterIds: opt.voterIds.filter((id) => id !== effectiveVoterId),
              };
            }
            return opt;
          }
        });

        const newTotalVotes = updatedOptions.reduce((sum, o) => sum + o.voterIds.length, 0);

        return {
          ...msg,
          poll: {
            ...poll,
            options: updatedOptions,
            totalVotes: newTotalVotes,
          },
        };
      })
    );
  };

  // Start Call Handler
  const handleStartCall = (peer: User, type: CallType) => {
    setActiveCall({
      peer,
      type,
      isIncoming: false,
    });
  };

  // End Call Handler
  const handleEndCall = (durationSeconds: number) => {
    if (activeCall) {
      const record: CallRecord = {
        id: `call_${Date.now()}`,
        peer: activeCall.peer,
        type: activeCall.type,
        direction: activeCall.isIncoming ? 'incoming' : 'outgoing',
        timestamp: Date.now(),
        durationSeconds,
      };
      setCalls((prev) => [record, ...prev]);
    }
    setActiveCall(null);
  };

  // Add Friend Handler
  const handleAddFriend = (newFriend: User) => {
    setUsers((prev) => {
      if (prev.some((u) => u.id === newFriend.id || u.username === newFriend.username)) {
        return prev;
      }
      return [...prev, newFriend];
    });
  };

  // Switch / Login User
  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    setActiveChatPeer(null);
    setIsGroupChatOpen(false);
  };

  // Register New User
  const handleRegisterNewUser = (user: User) => {
    setUsers((prev) => [...prev, user]);
    setCurrentUser(user);
    setActiveChatPeer(null);
    setIsGroupChatOpen(false);
  };

  // Update Group Handler
  const handleUpdateGroup = (updatedGroup: Group) => {
    setGroups((prev) => prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g)));
  };

  // Calculate unread counters
  const totalUnreadMessages = users
    .filter((u) => u.id !== currentUser.id)
    .reduce((total, peer) => {
      const count = messages.filter(
        (m) => m.senderId === peer.id && m.recipientId === currentUser.id && m.status !== 'read'
      ).length;
      return total + count;
    }, 0);

  // Current screen title
  const currentTitle = isGroupChatOpen
    ? primaryGroup.name
    : activeChatPeer
    ? activeChatPeer.name
    : 'Noor Chat';

  return (
    <AndroidFrame
      activeScreenTitle={currentTitle}
      isDeviceMode={isDeviceMode}
      onToggleDeviceMode={() => setIsDeviceMode(!isDeviceMode)}
    >
      {/* Network connectivity offline alert */}
      <OfflineIndicator />

      {/* Heads-up Android notification banner */}
      <NotificationsBanner
        notification={activeNotification}
        onOpenNotification={(notif) => {
          const peer = users.find((u) => u.id === notif.chatId);
          if (peer) {
            setActiveChatPeer(peer);
            setIsGroupChatOpen(false);
          }
          setActiveNotification(null);
        }}
        onDismiss={() => setActiveNotification(null)}
      />

      {/* Main Application Router / View Switcher */}
      {activeCall ? (
        /* Fullscreen Audio / Video Calling Stage */
        <CallScreen
          peer={activeCall.peer}
          type={activeCall.type}
          isIncoming={activeCall.isIncoming}
          onEndCall={handleEndCall}
        />
      ) : activeChatPeer ? (
        /* 1-to-1 Private Chat Screen */
        <ChatWindow
          currentUser={currentUser}
          peer={activeChatPeer}
          messages={messages.filter(
            (m) =>
              (m.senderId === currentUser.id && m.recipientId === activeChatPeer.id) ||
              (m.senderId === activeChatPeer.id && m.recipientId === currentUser.id)
          )}
          onSendMessage={handleSendMessage}
          onBack={() => setActiveChatPeer(null)}
          onStartCall={(type) => handleStartCall(activeChatPeer, type)}
          onAddReaction={handleAddReaction}
        />
      ) : isGroupChatOpen ? (
        /* Private 10-Member Group Chat Screen */
        <GroupChatWindow
          currentUser={currentUser}
          group={primaryGroup}
          allUsers={users}
          messages={messages.filter((m) => m.groupId === primaryGroup.id)}
          onSendMessage={handleSendMessage}
          onVotePoll={handleVotePoll}
          onUpdateGroup={handleUpdateGroup}
          onBack={() => setIsGroupChatOpen(false)}
        />
      ) : (
        /* Main Android Tabs (Chats, Groups, Calls, Contacts) */
        <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
          {/* Top Android Material 3 App Bar */}
          <div className="shrink-0 flex items-center justify-between px-4 py-2.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-900 z-20">
            <NoorLogo size="sm" />

            <div className="flex items-center gap-2">
              {/* PWA Install Button & Banner */}
              <PWAInstallButton />

              {/* Build APK & Firebase Guide Button */}
              <button
                id="btn-open-firebase-guide"
                onClick={() => setShowFirebaseGuide(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-600/30 to-teal-600/20 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                title="View Android APK & Firebase Guide"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">APK & Cloud</span>
              </button>

              {/* User Account Avatar & Switcher */}
              <button
                id="btn-account-switcher"
                onClick={() => setShowAuthModal(true)}
                className="relative flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-800 transition cursor-pointer"
                title={`Signed in as ${currentUser.name} (@${currentUser.username})`}
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500/60"
                />
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </button>
            </div>
          </div>

          {/* Active Tab Screen */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {activeTab === 'chats' && (
              <ChatList
                currentUser={currentUser}
                users={users}
                messages={messages}
                group={primaryGroup}
                onSelectChat={(peer) => setActiveChatPeer(peer)}
                onSelectGroup={() => setIsGroupChatOpen(true)}
                onNewChat={() => setActiveTab('contacts')}
              />
            )}

            {activeTab === 'groups' && (
              <div className="flex-1 flex flex-col p-4 bg-slate-950 overflow-y-auto">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-400" />
                    Private 10-Member Group
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Capped private chat circle strictly limited to 10 verified participants.
                  </p>
                </div>

                {/* Group Card */}
                <div
                  onClick={() => setIsGroupChatOpen(true)}
                  className="p-4 rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-teal-950/40 border border-emerald-500/30 hover:border-emerald-500/60 shadow-xl cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3.5 mb-3">
                    <img
                      src={primaryGroup.avatar}
                      alt={primaryGroup.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/50 shadow-md"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-white group-hover:text-emerald-300 transition">
                          {primaryGroup.name}
                        </h4>
                      </div>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                        {primaryGroup.members.length} / 10 Members (Full)
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {primaryGroup.description}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-emerald-400 font-semibold">
                    <span>Open Group Discussion &gt;</span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      10 Active participants
                    </span>
                  </div>
                </div>

                {/* Member Preview Avatars */}
                <div className="mt-6">
                  <span className="text-xs font-semibold text-slate-400 mb-2 block">
                    Enrolled Circle Members (10/10)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {primaryGroup.members.map((m) => (
                      <div
                        key={m.userId}
                        className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80"
                      >
                        <img
                          src={m.avatar}
                          alt={m.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{m.name}</p>
                          <p className="text-[10px] text-slate-500">@{m.username}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'calls' && (
              <CallsHistory
                calls={calls}
                onStartCall={(peer, type) => handleStartCall(peer, type)}
                onClearHistory={() => setCalls([])}
              />
            )}

            {activeTab === 'contacts' && (
              <FriendsList
                currentUser={currentUser}
                users={users}
                onStartChat={(peer) => setActiveChatPeer(peer)}
                onStartCall={(peer, type) => handleStartCall(peer, type)}
                onAddFriend={handleAddFriend}
              />
            )}
          </div>

          {/* Android Bottom Navigation Bar */}
          <div className="shrink-0 h-16 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 flex items-center justify-around px-2 z-30">
            {/* Chats Tab */}
            <button
              id="nav-tab-chats"
              onClick={() => setActiveTab('chats')}
              className={`flex flex-col items-center gap-1 transition cursor-pointer relative py-1 px-3 rounded-xl ${
                activeTab === 'chats' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <MessageSquare className="w-5 h-5" />
                {totalUnreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400" />
                )}
              </div>
              <span className="text-[10px] tracking-tight">Chats</span>
            </button>

            {/* Groups Tab */}
            <button
              id="nav-tab-groups"
              onClick={() => setActiveTab('groups')}
              className={`flex flex-col items-center gap-1 transition cursor-pointer py-1 px-3 rounded-xl ${
                activeTab === 'groups' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Users className="w-5 h-5" />
                <span className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full bg-amber-500/30 text-amber-300 text-[8px] font-bold">
                  10
                </span>
              </div>
              <span className="text-[10px] tracking-tight">VIP Group</span>
            </button>

            {/* Calls Tab */}
            <button
              id="nav-tab-calls"
              onClick={() => setActiveTab('calls')}
              className={`flex flex-col items-center gap-1 transition cursor-pointer py-1 px-3 rounded-xl ${
                activeTab === 'calls' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Phone className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">Calls</span>
            </button>

            {/* Contacts Tab */}
            <button
              id="nav-tab-contacts"
              onClick={() => setActiveTab('contacts')}
              className={`flex flex-col items-center gap-1 transition cursor-pointer py-1 px-3 rounded-xl ${
                activeTab === 'contacts' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Contact className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">Friends</span>
            </button>
          </div>
        </div>
      )}

      {/* User Registration & Multi-User Switcher Modal */}
      {showAuthModal && (
        <AuthModal
          currentUser={currentUser}
          onSelectUser={handleSelectUser}
          onRegisterNewUser={handleRegisterNewUser}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* Interactive Firebase & Android APK Guide Modal */}
      {showFirebaseGuide && (
        <FirebaseGuideModal onClose={() => setShowFirebaseGuide(false)} />
      )}
    </AndroidFrame>
  );
}
