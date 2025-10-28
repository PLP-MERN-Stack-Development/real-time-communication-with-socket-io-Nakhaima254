const User = require('../models/User');
const Message = require('../models/Message');
const Room = require('../models/Room');

const connectedUsers = new Map(); // socketId -> userId
const userSockets = new Map(); // userId -> socketId

const socketController = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // User login
    socket.on('user:login', async (data) => {
      try {
        const { username } = data;

        // Find or create user
        let user = await User.findOne({ username });
        if (!user) {
          user = new User({
            username,
            avatar: username.charAt(0).toUpperCase(),
            isOnline: true,
            socketId: socket.id
          });
        } else {
          user.isOnline = true;
          user.socketId = socket.id;
          user.lastSeen = new Date();
        }

        await user.save();

        // Store connection mappings
        connectedUsers.set(socket.id, user._id.toString());
        userSockets.set(user._id.toString(), socket.id);

        // Join user to their personal room for private messages
        socket.join(`user_${user._id}`);

        // Send user data back
        socket.emit('user:logged_in', {
          user: {
            id: user._id,
            username: user.username,
            avatar: user.avatar,
            isOnline: user.isOnline,
            lastSeen: user.lastSeen
          }
        });

        // Broadcast user online status
        socket.broadcast.emit('user:status_changed', {
          userId: user._id,
          isOnline: true
        });

        // Send system message
        const systemMessage = new Message({
          senderId: user._id,
          senderName: 'System',
          senderAvatar: 'S',
          content: `${username} joined the chat`,
          roomId: user._id, // Use user ID as room ID for system messages
          isSystem: true
        });
        await systemMessage.save();

        io.emit('message:new', {
          message: {
            id: systemMessage._id,
            senderId: null,
            senderName: 'System',
            senderAvatar: 'S',
            content: systemMessage.content,
            timestamp: systemMessage.timestamp,
            roomId: 'global',
            reactions: [],
            isRead: false,
            isSystem: true
          }
        });

      } catch (error) {
        console.error('Login error:', error);
        socket.emit('error', { message: 'Login failed' });
      }
    });

    // User logout/disconnect
    socket.on('user:logout', async () => {
      await handleUserDisconnect(socket);
    });

    // Send message
    socket.on('message:send', async (data) => {
      try {
        const { content, roomId } = data;
        const userId = connectedUsers.get(socket.id);

        if (!userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        const user = await User.findById(userId);
        if (!user) return;

        const message = new Message({
          senderId: user._id,
          senderName: user.username,
          senderAvatar: user.avatar,
          content,
          roomId,
          reactions: [],
          isRead: false
        });

        await message.save();

        // Update room's last message
        await Room.findByIdAndUpdate(roomId, { lastMessage: message._id });

        // Send to all users in the room
        io.to(roomId).emit('message:new', {
          message: {
            id: message._id,
            senderId: message.senderId,
            senderName: message.senderName,
            senderAvatar: message.senderAvatar,
            content: message.content,
            timestamp: message.timestamp,
            roomId: message.roomId,
            reactions: message.reactions,
            isRead: message.isRead,
            isSystem: message.isSystem
          }
        });

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Add reaction
    socket.on('message:reaction', async (data) => {
      try {
        const { messageId, emoji } = data;
        const userId = connectedUsers.get(socket.id);

        if (!userId) return;

        const message = await Message.findById(messageId);
        if (!message) return;

        const existingReaction = message.reactions.find(
          r => r.userId.toString() === userId && r.emoji === emoji
        );

        if (existingReaction) {
          // Remove reaction
          message.reactions = message.reactions.filter(
            r => !(r.userId.toString() === userId && r.emoji === emoji)
          );
        } else {
          // Add reaction
          message.reactions.push({ userId, emoji });
        }

        await message.save();

        io.to(message.roomId).emit('message:updated', {
          messageId,
          reactions: message.reactions
        });

      } catch (error) {
        console.error('Reaction error:', error);
      }
    });

    // Create room
    socket.on('room:create', async (data) => {
      try {
        const { name } = data;
        const userId = connectedUsers.get(socket.id);

        if (!userId) return;

        const room = new Room({
          name,
          participants: [userId],
          unreadCount: new Map(),
          isPrivate: false,
          createdBy: userId
        });

        await room.save();

        socket.emit('room:created', {
          room: {
            id: room._id,
            name: room.name,
            participants: room.participants,
            unreadCount: 0,
            isPrivate: room.isPrivate
          }
        });

      } catch (error) {
        console.error('Create room error:', error);
        socket.emit('error', { message: 'Failed to create room' });
      }
    });

    // Join room
    socket.on('room:join', async (data) => {
      try {
        const { roomId } = data;
        const userId = connectedUsers.get(socket.id);

        if (!userId) return;

        const room = await Room.findById(roomId);
        if (!room) return;

        if (!room.participants.includes(userId)) {
          room.participants.push(userId);
          await room.save();
        }

        socket.join(roomId);

        // Send room messages
        const messages = await Message.find({ roomId })
          .sort({ timestamp: 1 })
          .limit(50);

        socket.emit('room:joined', {
          roomId,
          messages: messages.map(msg => ({
            id: msg._id,
            senderId: msg.senderId,
            senderName: msg.senderName,
            senderAvatar: msg.senderAvatar,
            content: msg.content,
            timestamp: msg.timestamp,
            roomId: msg.roomId,
            reactions: msg.reactions,
            isRead: msg.isRead,
            isSystem: msg.isSystem
          }))
        });

      } catch (error) {
        console.error('Join room error:', error);
      }
    });

    // Start private chat
    socket.on('chat:private', async (data) => {
      try {
        const { userId: otherUserId } = data;
        const currentUserId = connectedUsers.get(socket.id);

        if (!currentUserId) return;

        // Check if private room already exists
        let room = await Room.findOne({
          isPrivate: true,
          participants: { $all: [currentUserId, otherUserId] }
        });

        if (!room) {
          const otherUser = await User.findById(otherUserId);
          if (!otherUser) return;

          room = new Room({
            name: otherUser.username,
            participants: [currentUserId, otherUserId],
            unreadCount: new Map(),
            isPrivate: true,
            createdBy: currentUserId
          });

          await room.save();
        }

        socket.emit('chat:private_started', {
          room: {
            id: room._id,
            name: room.name,
            participants: room.participants,
            unreadCount: 0,
            isPrivate: room.isPrivate
          }
        });

      } catch (error) {
        console.error('Private chat error:', error);
      }
    });

    // Typing indicator
    socket.on('user:typing', async (data) => {
      try {
        const { isTyping, roomId } = data;
        const userId = connectedUsers.get(socket.id);

        if (!userId) return;

        const user = await User.findById(userId);
        if (!user) return;

        user.isTyping = isTyping;
        await user.save();

        socket.to(roomId).emit('user:typing', {
          userId,
          username: user.username,
          isTyping
        });

      } catch (error) {
        console.error('Typing error:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      await handleUserDisconnect(socket);
    });
  });

  const handleUserDisconnect = async (socket) => {
    try {
      const userId = connectedUsers.get(socket.id);
      if (userId) {
        const user = await User.findById(userId);
        if (user) {
          user.isOnline = false;
          user.lastSeen = new Date();
          user.socketId = null;
          await user.save();

          // Broadcast offline status
          socket.broadcast.emit('user:status_changed', {
            userId,
            isOnline: false
          });
        }

        connectedUsers.delete(socket.id);
        userSockets.delete(userId);
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };
};

module.exports = socketController;