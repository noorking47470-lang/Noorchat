export type MessageType = 'text' | 'image' | 'audio' | 'file' | 'poll';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface Reaction {
  emoji: string;
  userId: string;
  userName: string;
}

export interface PollOption {
  id: string;
  text: string;
  voterIds: string[]; // List of user IDs who voted for this option
}

export interface PollData {
  id: string;
  question: string;
  options: PollOption[];
  allowMultipleAnswers: boolean;
  totalVotes: number;
  closed?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientId?: string; // For 1-to-1 chat
  groupId?: string;     // For group chat
  type: MessageType;
  content: string;      // text content or caption
  mediaUrl?: string;    // Base64 data URL or external URL
  mediaName?: string;
  mediaSize?: string;
  audioDuration?: number; // In seconds for voice notes
  poll?: PollData;      // For poll messages
  timestamp: number;
  status: MessageStatus;
  reactions?: Reaction[];
  replyTo?: {
    id: string;
    senderName: string;
    snippet: string;
  };
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  avatar: string;
  bio?: string;
  online: boolean;
  lastSeen?: string;
  publicKey?: string; // Simulated E2E encryption key
}

export interface GroupMember {
  userId: string;
  name: string;
  username: string;
  avatar: string;
  role: 'admin' | 'member';
  joinedAt: number;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  avatar: string;
  createdBy: string;
  createdAt: number;
  maxMembers: 10; // Strict limit: 10 members
  members: GroupMember[];
  lastMessage?: Message;
  unreadCount?: number;
}

export interface ChatThread {
  id: string; // usually peer user id
  peer: User;
  lastMessage?: Message;
  unreadCount: number;
  isPinned?: boolean;
}

export type CallType = 'audio' | 'video';
export type CallStatus = 'ringing' | 'connected' | 'ended' | 'missed';

export interface CallSession {
  id: string;
  type: CallType;
  peer: User;
  isIncoming: boolean;
  status: CallStatus;
  startTime?: number;
  durationSeconds?: number;
}

export interface CallRecord {
  id: string;
  peer: User;
  type: CallType;
  direction: 'incoming' | 'outgoing' | 'missed';
  timestamp: number;
  durationSeconds: number;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  avatar?: string;
  chatId?: string;
  isGroup?: boolean;
  timestamp: number;
}
