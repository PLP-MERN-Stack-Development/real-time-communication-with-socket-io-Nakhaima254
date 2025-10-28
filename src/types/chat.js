export const User = {
  id: '',
  username: '',
  avatar: '',
  isOnline: false,
  lastSeen: 0,
  isTyping: false,
};

export const Message = {
  id: '',
  senderId: '',
  senderName: '',
  senderAvatar: '',
  content: '',
  timestamp: 0,
  roomId: '',
  reactions: [],
  isRead: false,
  isSystem: false,
};

export const Reaction = {
  userId: '',
  emoji: '',
};

export const Room = {
  id: '',
  name: '',
  participants: [],
  lastMessage: null,
  unreadCount: 0,
  isPrivate: false,
};

export const ChatState = {
  currentUser: null,
  users: [],
  messages: [],
  rooms: [],
  activeRoomId: '',
  isConnected: false,
  soundEnabled: false,
};