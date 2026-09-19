import { User, Message, Group, CallRecord } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_noor',
    name: 'Noor King',
    username: 'noorking',
    email: 'noorking47470@gmail.com',
    phone: '+1 (555) 019-4747',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: '✨ Spreading light & connectivity with Noor Chat. Lead Architect.',
    online: true,
  },
  {
    id: 'user_sarah',
    name: 'Sarah Al-Mansoor',
    username: 'sarah_m',
    email: 'sarah@noor.app',
    phone: '+1 (555) 234-5678',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: '🎨 Mobile UI/UX designer. Passionate about Android Material 3.',
    online: true,
  },
  {
    id: 'user_alex',
    name: 'Alex Rivera',
    username: 'alex_dev',
    email: 'alex.r@noor.app',
    phone: '+1 (555) 345-6789',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: '⚡ WebRTC & Real-time Systems Engineer. Coffee + Code.',
    online: true,
  },
  {
    id: 'user_zain',
    name: 'Zain Malik',
    username: 'zain_k',
    email: 'zain@noor.app',
    phone: '+1 (555) 456-7890',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bio: '🛡️ Cryptography & Security Auditor. Zero-knowledge protocols.',
    online: false,
    lastSeen: '12m ago',
  },
  {
    id: 'user_layla',
    name: 'Layla Hassan',
    username: 'layla_h',
    email: 'layla@noor.app',
    phone: '+1 (555) 567-8901',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    bio: '📱 Android Developer & Kotlin enthusiast.',
    online: true,
  },
  {
    id: 'user_tariq',
    name: 'Tariq Vance',
    username: 'tariq_v',
    email: 'tariq@noor.app',
    phone: '+1 (555) 678-9012',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    bio: '🚀 Product strategist & Android power user.',
    online: false,
    lastSeen: '1h ago',
  },
  {
    id: 'user_maryam',
    name: 'Maryam Chen',
    username: 'maryam_c',
    email: 'maryam@noor.app',
    phone: '+1 (555) 789-0123',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    bio: '✨ Quality assurance & test automation enthusiast.',
    online: true,
  },
  {
    id: 'user_omar',
    name: 'Omar Farooq',
    username: 'omar_f',
    email: 'omar@noor.app',
    phone: '+1 (555) 890-1234',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    bio: '☁️ Cloud backend & Firebase Architect.',
    online: false,
    lastSeen: 'yesterday',
  },
  {
    id: 'user_fatima',
    name: 'Fatima Zahra',
    username: 'fatima_z',
    email: 'fatima@noor.app',
    phone: '+1 (555) 901-2345',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    bio: '🎨 Digital illustrator and visual branding lead.',
    online: true,
  },
  {
    id: 'user_hamza',
    name: 'Hamza Rashid',
    username: 'hamza_r',
    email: 'hamza@noor.app',
    phone: '+1 (555) 012-3456',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    bio: '🎙️ Audio/Video codec & WebRTC streamer.',
    online: false,
    lastSeen: '3h ago',
  },
];

export const INITIAL_GROUP: Group = {
  id: 'group_noor_vips',
  name: 'Noor VIP Circle (10 Members)',
  description: 'Private high-security coordination channel strictly capped at 10 members.',
  avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
  createdBy: 'user_noor',
  createdAt: Date.now() - 86400000 * 3,
  maxMembers: 10,
  members: INITIAL_USERS.map((u, i) => ({
    userId: u.id,
    name: u.name,
    username: u.username,
    avatar: u.avatar,
    role: i === 0 ? 'admin' : 'member',
    joinedAt: Date.now() - 86400000 * (3 - i * 0.2),
  })),
};

const STORAGE_KEYS = {
  CURRENT_USER: 'noor_current_user',
  USERS: 'noor_users_list',
  MESSAGES: 'noor_messages_store',
  GROUPS: 'noor_groups_store',
  CALLS: 'noor_calls_history',
};

// Initialize default seed messages
export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg_1',
    senderId: 'user_sarah',
    senderName: 'Sarah Al-Mansoor',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    recipientId: 'user_noor',
    type: 'text',
    content: 'Assalamu alaikum Noor! Welcome to Noor Chat 🌟 The Android Material design and colors look crisp.',
    timestamp: Date.now() - 3600000 * 2,
    status: 'read',
    reactions: [{ emoji: '❤️', userId: 'user_noor', userName: 'Noor King' }],
  },
  {
    id: 'msg_2',
    senderId: 'user_noor',
    senderName: 'Noor King',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    recipientId: 'user_sarah',
    type: 'text',
    content: 'Wa alaikum assalam Sarah! Everything is working smoothly: audio, video calls, voice notes, and media sharing.',
    timestamp: Date.now() - 3600000 * 1.8,
    status: 'read',
  },
  {
    id: 'msg_3',
    senderId: 'user_sarah',
    senderName: 'Sarah Al-Mansoor',
    senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    recipientId: 'user_noor',
    type: 'image',
    content: 'Here is the prototype screenshot for the Android navigation flow!',
    mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    mediaName: 'android_ui_flow.jpg',
    mediaSize: '420 KB',
    timestamp: Date.now() - 3600000 * 1.5,
    status: 'read',
  },
  {
    id: 'msg_4',
    senderId: 'user_alex',
    senderName: 'Alex Rivera',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    recipientId: 'user_noor',
    type: 'text',
    content: 'Hey Noor, testing the WebRTC audio & video calling pipeline on Android! Can we do a quick call test?',
    timestamp: Date.now() - 3600000 * 0.9,
    status: 'delivered',
  },
  // Group messages
  {
    id: 'grp_msg_1',
    senderId: 'user_noor',
    senderName: 'Noor King',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    groupId: 'group_noor_vips',
    type: 'text',
    content: 'Welcome everyone to the private Noor VIP Circle. Remember our private group is strictly limited to 10 verified members.',
    timestamp: Date.now() - 86400000,
    status: 'read',
  },
  {
    id: 'grp_msg_2',
    senderId: 'user_layla',
    senderName: 'Layla Hassan',
    senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    groupId: 'group_noor_vips',
    type: 'text',
    content: 'All 10 slots are currently filled! Checking the Android APK packaging instructions now.',
    timestamp: Date.now() - 3600000 * 4,
    status: 'read',
  },
  {
    id: 'grp_msg_poll_1',
    senderId: 'user_alex',
    senderName: 'Alex Rivera',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    groupId: 'group_noor_vips',
    type: 'poll',
    content: '📊 Poll: Preferred time for our weekly 10-member group sync?',
    poll: {
      id: 'poll_initial_1',
      question: 'Preferred time for our weekly 10-member group sync?',
      options: [
        { id: 'opt_1', text: 'Thursday 4:00 PM UTC', voterIds: ['user_alex', 'user_sarah', 'user_layla'] },
        { id: 'opt_2', text: 'Friday 2:00 PM UTC', voterIds: ['user_tariq', 'user_zain'] },
        { id: 'opt_3', text: 'Saturday 11:00 AM UTC', voterIds: ['user_maryam'] },
      ],
      allowMultipleAnswers: false,
      totalVotes: 6,
    },
    timestamp: Date.now() - 3600000 * 2,
    status: 'read',
  },
];

export const INITIAL_CALLS: CallRecord[] = [
  {
    id: 'call_1',
    peer: INITIAL_USERS[1], // Sarah
    type: 'video',
    direction: 'incoming',
    timestamp: Date.now() - 3600000 * 5,
    durationSeconds: 142,
  },
  {
    id: 'call_2',
    peer: INITIAL_USERS[2], // Alex
    type: 'audio',
    direction: 'outgoing',
    timestamp: Date.now() - 3600000 * 18,
    durationSeconds: 310,
  },
  {
    id: 'call_3',
    peer: INITIAL_USERS[3], // Zain
    type: 'video',
    direction: 'missed',
    timestamp: Date.now() - 86400000 * 1.5,
    durationSeconds: 0,
  },
];

export function getStoredCurrentUser(): User {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn(e);
  }
  return INITIAL_USERS[0]; // Default Noor
}

export function setStoredCurrentUser(user: User) {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

export function getStoredUsers(): User[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn(e);
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  return INITIAL_USERS;
}

export function saveStoredUsers(users: User[]) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function getStoredMessages(): Message[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn(e);
  }
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
  return INITIAL_MESSAGES;
}

export function saveStoredMessages(messages: Message[]) {
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
}

export function getStoredGroups(): Group[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GROUPS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn(e);
  }
  localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify([INITIAL_GROUP]));
  return [INITIAL_GROUP];
}

export function saveStoredGroups(groups: Group[]) {
  localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
}

export function getStoredCalls(): CallRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CALLS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn(e);
  }
  localStorage.setItem(STORAGE_KEYS.CALLS, JSON.stringify(INITIAL_CALLS));
  return INITIAL_CALLS;
}

export function saveStoredCalls(calls: CallRecord[]) {
  localStorage.setItem(STORAGE_KEYS.CALLS, JSON.stringify(calls));
}
