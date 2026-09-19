import React, { useState, useRef, useEffect } from 'react';
import { User, Message, Group, GroupMember, PollData } from '../types';
import {
  ArrowLeft,
  Users,
  Send,
  Image as ImageIcon,
  Paperclip,
  Smile,
  ShieldAlert,
  UserPlus,
  UserMinus,
  X,
  Info,
  ShieldCheck,
  CheckCheck,
  BarChart2,
} from 'lucide-react';
import { playSentSound, playNotificationSound } from '../utils/audio';
import { CreatePollModal } from './CreatePollModal';
import { PollCard } from './PollCard';

interface GroupChatWindowProps {
  currentUser: User;
  group: Group;
  allUsers: User[];
  messages: Message[];
  onSendMessage: (msg: Omit<Message, 'id' | 'timestamp' | 'status'>) => void;
  onVotePoll?: (messageId: string, optionId: string, voterId?: string) => void;
  onUpdateGroup: (updatedGroup: Group) => void;
  onBack: () => void;
}

export const GroupChatWindow: React.FC<GroupChatWindowProps> = ({
  currentUser,
  group,
  allUsers,
  messages,
  onSendMessage,
  onVotePoll,
  onUpdateGroup,
  onBack,
}) => {
  const [inputText, setInputText] = useState('');
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showAddMemberSelector, setShowAddMemberSelector] = useState(false);
  const [showCreatePollModal, setShowCreatePollModal] = useState(false);
  const [memberLimitWarning, setMemberLimitWarning] = useState('');
  const [activeMediaModal, setActiveMediaModal] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage({
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      groupId: group.id,
      type: 'text',
      content: inputText.trim(),
    });

    playSentSound();
    setInputText('');

    // Simulate other group members interacting
    setTimeout(() => {
      const otherMembers = group.members.filter((m) => m.userId !== currentUser.id);
      if (otherMembers.length > 0) {
        const randomMember = otherMembers[Math.floor(Math.random() * otherMembers.length)];
        const groupReplies = [
          `@${currentUser.username} Noted! 10-member quorum confirmed.`,
          `Great progress on the Android APK deployment, team.`,
          `Noor Chat group sync is working flawlessly!`,
          `Affirmative, checking notifications now.`,
        ];
        const reply = groupReplies[Math.floor(Math.random() * groupReplies.length)];

        onSendMessage({
          senderId: randomMember.userId,
          senderName: randomMember.name,
          senderAvatar: randomMember.avatar,
          groupId: group.id,
          type: 'text',
          content: reply,
        });
        playNotificationSound();
      }
    }, 2200);
  };

  // Add Member with STRICT 10-member boundary enforcement!
  const handleAddMember = (user: User) => {
    if (group.members.length >= 10) {
      setMemberLimitWarning('⚠️ Capacity reached! This private group is strictly limited to 10 members.');
      return;
    }

    if (group.members.some((m) => m.userId === user.id)) {
      setMemberLimitWarning(`${user.name} is already a member of this private circle.`);
      return;
    }

    const newMember: GroupMember = {
      userId: user.id,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      role: 'member',
      joinedAt: Date.now(),
    };

    const updatedMembers = [...group.members, newMember];
    onUpdateGroup({
      ...group,
      members: updatedMembers,
    });

    // Send system announcement
    onSendMessage({
      senderId: 'system',
      senderName: 'Noor System',
      senderAvatar: '/icon.svg',
      groupId: group.id,
      type: 'text',
      content: `🔔 ${user.name} (@${user.username}) was added to the private group (${updatedMembers.length}/10 members).`,
    });

    setMemberLimitWarning('');
    setShowAddMemberSelector(false);
  };

  // Remove Member
  const handleRemoveMember = (userId: string) => {
    const memberToRemove = group.members.find((m) => m.userId === userId);
    if (!memberToRemove) return;

    const updatedMembers = group.members.filter((m) => m.userId !== userId);
    onUpdateGroup({
      ...group,
      members: updatedMembers,
    });

    // Send system announcement
    onSendMessage({
      senderId: 'system',
      senderName: 'Noor System',
      senderAvatar: '/icon.svg',
      groupId: group.id,
      type: 'text',
      content: `🔔 ${memberToRemove.name} left the private group (${updatedMembers.length}/10 members).`,
    });
  };

  // Image Upload
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onSendMessage({
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        groupId: group.id,
        type: 'image',
        content: 'Shared group image',
        mediaUrl: reader.result as string,
        mediaName: file.name,
      });
      playSentSound();
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePoll = (pollData: Omit<PollData, 'id' | 'totalVotes'>) => {
    const pollId = `poll_${Date.now()}`;
    const newPoll: PollData = {
      ...pollData,
      id: pollId,
      totalVotes: 0,
    };

    onSendMessage({
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      groupId: group.id,
      type: 'poll',
      content: `📊 Poll: ${newPoll.question}`,
      poll: newPoll,
    });

    playSentSound();
    setShowCreatePollModal(false);

    // Simulate other group members voting after a brief moment
    setTimeout(() => {
      const otherMembers = group.members.filter((m) => m.userId !== currentUser.id);
      if (otherMembers.length > 0 && onVotePoll) {
        const votersToSimulate = [...otherMembers].sort(() => 0.5 - Math.random()).slice(0, 3);
        votersToSimulate.forEach((member, idx) => {
          setTimeout(() => {
            const randomOpt = newPoll.options[Math.floor(Math.random() * newPoll.options.length)];
            const currentPollMsg = messages.find(
              (m) => m.groupId === group.id && m.type === 'poll' && m.poll?.id === pollId
            );
            if (currentPollMsg && randomOpt) {
              onVotePoll(currentPollMsg.id, randomOpt.id, member.userId);
            }
          }, (idx + 1) * 800);
        });
      }
    }, 1200);
  };

  const isFull = group.members.length >= 10;

  return (
    <div className="relative flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Android App Bar */}
      <div className="shrink-0 flex items-center justify-between px-3 py-2.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 z-20">
        <div className="flex items-center gap-2.5">
          <button
            id="btn-back-from-group"
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div
            className="relative cursor-pointer"
            onClick={() => setShowMembersModal(true)}
            title="View Group Info"
          >
            <img
              src={group.avatar}
              alt={group.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/50"
            />
            <span className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded-full bg-emerald-600 text-[9px] font-bold text-white shadow">
              {group.members.length}/10
            </span>
          </div>

          <div
            className="flex flex-col leading-tight cursor-pointer"
            onClick={() => setShowMembersModal(true)}
          >
            <span className="font-semibold text-sm text-white flex items-center gap-1.5">
              {group.name}
            </span>
            <span className="text-[11px] text-emerald-400 font-medium">
              {group.members.length} / 10 Members {isFull && '• (Full)'}
            </span>
          </div>
        </div>

        {/* Action Buttons: Create Poll, Group Members */}
        <div className="flex items-center gap-1">
          <button
            id="btn-open-create-poll-header"
            onClick={() => setShowCreatePollModal(true)}
            className="p-2 rounded-full hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 transition cursor-pointer flex items-center gap-1 text-xs"
            title="Create Group Poll"
          >
            <BarChart2 className="w-4 h-4" />
            <span className="hidden sm:inline font-semibold">Poll</span>
          </button>

          <button
            id="btn-open-group-members"
            onClick={() => setShowMembersModal(true)}
            className="p-2 rounded-full hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 transition cursor-pointer flex items-center gap-1 text-xs"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline font-semibold">Members</span>
          </button>
        </div>
      </div>

      {/* Messages Scrollable List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {/* Private Group Security Banner */}
        <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white">Private 10-Member Circle:</span>{' '}
            Strictly capped at 10 verified participants. All media, text, and files are protected with client-side end-to-end encryption.
          </div>
        </div>

        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const isSystem = msg.senderId === 'system';
          const timeFormatted = new Date(msg.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-1">
                <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-medium">
                  {msg.content}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
            >
              <div className="flex items-end gap-2 max-w-[85%]">
                {!isMe && (
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    className="w-7 h-7 rounded-full object-cover shrink-0 mb-1 border border-slate-700"
                  />
                )}

                <div
                  className={`relative rounded-2xl p-3 shadow-md ${
                    isMe
                      ? 'bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-tr-none'
                      : 'bg-slate-800/95 text-slate-100 rounded-tl-none border border-slate-700/50'
                  }`}
                >
                  {/* Sender Name for other members */}
                  {!isMe && (
                    <p className="text-[11px] font-bold text-amber-300 mb-1 flex items-center gap-1">
                      <span>{msg.senderName}</span>
                    </p>
                  )}

                  {/* Media: Image */}
                  {msg.type === 'image' && msg.mediaUrl && (
                    <div className="mb-2 rounded-xl overflow-hidden border border-black/20">
                      <img
                        src={msg.mediaUrl}
                        alt="shared"
                        className="w-full max-h-60 object-cover cursor-pointer hover:opacity-95 transition"
                        onClick={() => setActiveMediaModal(msg.mediaUrl!)}
                      />
                    </div>
                  )}

                  {/* Poll Card Display */}
                  {msg.type === 'poll' && msg.poll && (
                    <div className="my-1">
                      <PollCard
                        poll={msg.poll}
                        currentUser={currentUser}
                        allUsers={allUsers}
                        onVote={(optId) => onVotePoll?.(msg.id, optId)}
                      />
                    </div>
                  )}

                  {/* Text Content */}
                  {msg.content && msg.type !== 'poll' && (
                    <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                  )}

                  {/* Timestamp */}
                  <div
                    className={`flex items-center gap-1 justify-end mt-1 text-[10px] ${
                      isMe ? 'text-emerald-200/80' : 'text-slate-400'
                    }`}
                  >
                    <span>{timeFormatted}</span>
                    {isMe && <CheckCheck className="w-3.5 h-3.5 text-amber-300" />}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="shrink-0 p-2.5 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80">
        <form onSubmit={handleSendText} className="flex items-center gap-1.5">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
          <button
            type="button"
            id="btn-group-attach-image"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
            title="Attach Image"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* Create Poll Button in Input Bar */}
          <button
            type="button"
            id="btn-group-create-poll"
            onClick={() => setShowCreatePollModal(true)}
            className="p-2 rounded-full text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition cursor-pointer"
            title="Create Poll"
          >
            <BarChart2 className="w-5 h-5" />
          </button>

          <input
            type="text"
            id="input-group-message"
            placeholder={`Message ${group.name}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-3 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />

          <button
            type="submit"
            id="btn-send-group-message"
            disabled={!inputText.trim()}
            className={`p-2.5 rounded-full transition shadow-lg ${
              inputText.trim()
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white cursor-pointer active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Group Members & Capacity Management Modal */}
      {showMembersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-emerald-500/30 p-6 shadow-2xl text-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Private Group Members</h3>
              </div>
              <button
                onClick={() => {
                  setShowMembersModal(false);
                  setMemberLimitWarning('');
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Capacity Meter: 10 Member Limit */}
            <div className="my-4 p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300">Group Roster Limit</span>
                <span className={`font-bold ${isFull ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {group.members.length} of 10 Members ({isFull ? '100% Full' : `${10 - group.members.length} slots free`})
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isFull
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  }`}
                  style={{ width: `${(group.members.length / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* Member Limit Alert Message */}
            {memberLimitWarning && (
              <div className="mb-3 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{memberLimitWarning}</span>
              </div>
            )}

            {/* Add Member Button or Capacity Banner */}
            <div className="mb-3">
              {isFull ? (
                <div className="p-2 rounded-xl bg-slate-800/80 text-center text-xs text-slate-400 border border-slate-700">
                  🔒 Group at maximum capacity (10/10 members). Remove a member to add someone new.
                </div>
              ) : (
                <button
                  id="btn-add-group-member"
                  onClick={() => setShowAddMemberSelector(true)}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Friend to Group ({10 - group.members.length} slots left)
                </button>
              )}
            </div>

            {/* Members List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {group.members.map((member) => {
                const isCurrentUser = member.userId === currentUser.id;
                return (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-white">{member.name}</span>
                          {member.role === 'admin' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Admin
                            </span>
                          )}
                          {isCurrentUser && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">@{member.username}</span>
                      </div>
                    </div>

                    {!isCurrentUser && (
                      <button
                        onClick={() => handleRemoveMember(member.userId)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Remove member"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add Member Selector Dialog */}
      {showAddMemberSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-emerald-500/30 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white">Select Friend to Add</h4>
              <button
                onClick={() => setShowAddMemberSelector(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-3 max-h-60 overflow-y-auto space-y-2">
              {allUsers
                .filter((u) => !group.members.some((m) => m.userId === u.id))
                .map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => handleAddMember(friend)}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 transition text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={friend.avatar}
                        alt={friend.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-xs font-semibold text-white">{friend.name}</p>
                        <p className="text-[10px] text-slate-400">@{friend.username}</p>
                      </div>
                    </div>
                    <UserPlus className="w-4 h-4 text-emerald-400" />
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Photo Modal */}
      {activeMediaModal && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setActiveMediaModal(null)}
        >
          <div className="relative max-w-lg max-h-[85vh]">
            <img
              src={activeMediaModal}
              alt="full preview"
              className="rounded-2xl max-w-full max-h-[85vh] object-contain shadow-2xl"
            />
            <button
              onClick={() => setActiveMediaModal(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Create Poll Modal */}
      {showCreatePollModal && (
        <CreatePollModal
          onClose={() => setShowCreatePollModal(false)}
          onCreatePoll={handleCreatePoll}
        />
      )}
    </div>
  );
};
