import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';

const ChatContext = createContext(undefined);

const GLOBAL_ROOM_ID = 'global';

export const ChatProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [rooms, setRooms] = useState([
    {
      id: GLOBAL_ROOM_ID,
      name: 'Global Chat',
      participants: [],
      unreadCount: 0,
      isPrivate: false,
    },
  ]);
  const [activeRoomId, setActiveRoomId] = useState(GLOBAL_ROOM_ID);
  const [isConnected, setIsConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      upgrade: true,
      forceNew: true,
      withCredentials: true,
    });

    setSocket(newSocket);

    // Socket event listeners
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('user:logged_in', (data) => {
      setCurrentUser(data.user);
    });

    newSocket.on('user:status_changed', (data) => {
      setUsers(prev => prev.map(user =>
        user.id === data.userId
          ? { ...user, isOnline: data.isOnline, lastSeen: Date.now() }
          : user
      ));
    });

    newSocket.on('message:new', (data) => {
      setMessages(prev => [...prev, data.message]);
      playNotificationSound();
    });

    newSocket.on('message:updated', (data) => {
      setMessages(prev => prev.map(msg =>
        msg.id === data.messageId
          ? { ...msg, reactions: data.reactions }
          : msg
      ));
    });

    newSocket.on('user:typing', (data) => {
      setUsers(prev => prev.map(user =>
        user.id === data.userId
          ? { ...user, isTyping: data.isTyping }
          : user
      ));
    });

    newSocket.on('room:created', (data) => {
      setRooms(prev => [...prev, data.room]);
    });

    newSocket.on('room:joined', (data) => {
      // Handle room join response
    });

    newSocket.on('chat:private_started', (data) => {
      setRooms(prev => [...prev, data.room]);
      setActiveRoomId(data.room.id);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error('Connection error');
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // Load persisted data
  useEffect(() => {
    const savedSound = localStorage.getItem('soundEnabled');
    if (savedSound !== null) setSoundEnabled(JSON.parse(savedSound));
  }, []);

  // Persist data
  useEffect(() => {
    localStorage.setItem('soundEnabled', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  // Fetch users from server
  useEffect(() => {
    if (!socket || !currentUser) return;

    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/users');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const users = await response.json();
        setUsers(users.filter((u) => u.id !== currentUser.id));
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, [socket, currentUser]);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (soundEnabled) {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnMpBSuAzvLZiTcIGWi77eefTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUxh9Hz04IzBh5uwO/jmUgND1as5++wXRgIPpbb8sZzKQUrgM7y2Yk3CBlou+3nn00QDFCn4/C2YxwGOJLX8sx5LAUkd8fw3ZBACHRDAAEBAQEBAQEBAQE');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }
  }, [soundEnabled]);

  const login = useCallback((username) => {
    if (socket) {
      socket.emit('user:login', { username });
    }
  }, [socket]);

  const logout = useCallback(() => {
    if (socket) {
      socket.emit('user:logout');
    }
    setCurrentUser(null);
  }, [socket]);

  const sendMessage = useCallback(
    (content, roomId) => {
      if (!socket || !currentUser) return;

      socket.emit('message:send', { content, roomId });
    },
    [socket, currentUser]
  );

  const addReaction = useCallback(
    (messageId, emoji) => {
      if (!socket) return;

      socket.emit('message:reaction', { messageId, emoji });
    },
    [socket]
  );

  const createRoom = useCallback((name) => {
    if (!socket) return;

    socket.emit('room:create', { name });
  }, [socket]);

  const joinRoom = useCallback((roomId) => {
    if (!socket) return;

    socket.emit('room:join', { roomId });
    setActiveRoomId(roomId);
  }, [socket]);

  const setActiveRoom = useCallback((roomId) => {
    setActiveRoomId(roomId);
    markRoomAsRead(roomId);
  }, []);

  const startPrivateChat = useCallback(
    (userId) => {
      if (!socket) return;

      socket.emit('chat:private', { userId });
    },
    [socket]
  );

  const setTyping = useCallback(
    (isTyping) => {
      if (!socket || !currentUser) return;

      socket.emit('user:typing', { isTyping, roomId: activeRoomId });
    },
    [socket, currentUser, activeRoomId]
  );

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  const markRoomAsRead = useCallback((roomId) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId ? { ...room, unreadCount: 0 } : room
      )
    );
  }, []);

  // Fetch rooms from server
  useEffect(() => {
    if (!socket || !currentUser) return;

    const fetchRooms = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/rooms');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const serverRooms = await response.json();

        // Merge with local rooms, keeping the global room
        const globalRoom = rooms.find(r => r.id === GLOBAL_ROOM_ID);
        const mergedRooms = [globalRoom, ...serverRooms.map((r) => ({
          id: r._id,
          name: r.name,
          participants: r.participants,
          unreadCount: 0,
          isPrivate: r.isPrivate
        }))];

        setRooms(mergedRooms);
      } catch (error) {
        console.error('Failed to fetch rooms:', error);
      }
    };

    fetchRooms();
  }, [socket, currentUser]);

  return (
    <ChatContext.Provider
      value={{
        currentUser,
        users,
        messages,
        rooms,
        activeRoomId,
        isConnected,
        soundEnabled,
        login,
        logout,
        sendMessage,
        addReaction,
        createRoom,
        joinRoom,
        setActiveRoom,
        startPrivateChat,
        setTyping,
        toggleSound,
        markRoomAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};
