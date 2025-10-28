import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Users, Send, LogOut } from 'lucide-react';
import ChatArea from '@/components/ChatArea';
import UserList from '@/components/UserList';
import AuthPage from '@/components/AuthPage';
import { useChat } from '@/contexts/ChatContext';

const Index = () => {
  const {
    currentUser,
    users,
    messages,
    rooms,
    activeRoomId,
    isConnected,
    login,
    logout,
    sendMessage,
    joinRoom,
    createRoom,
    startPrivateChat,
    markRoomAsRead,
  } = useChat();

  const [messageInput, setMessageInput] = useState('');
  const [roomNameInput, setRoomNameInput] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  useEffect(() => {
    if (activeRoomId) {
      markRoomAsRead(activeRoomId);
    }
  }, [activeRoomId, messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim() && activeRoomId) {
      sendMessage(messageInput.trim(), activeRoomId);
      setMessageInput('');
    }
  };

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (roomNameInput.trim()) {
      createRoom(roomNameInput.trim());
      setRoomNameInput('');
      setShowCreateRoom(false);
    }
  };

  const handleJoinRoom = (roomId) => {
    joinRoom(roomId);
  };

  const handleStartPrivateChat = (userId) => {
    startPrivateChat(userId);
  };

  const activeRoom = rooms.find(room => room.id === activeRoomId);

  if (!currentUser) {
    return <AuthPage onLogin={login} />;
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">ChatFlow</h1>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
              {currentUser.avatar}
            </div>
            <div>
              <p className="font-medium">{currentUser.username}</p>
              <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
                {isConnected ? "Online" : "Offline"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Rooms */}
        <div className="flex-1 overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">Rooms</h2>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCreateRoom(!showCreateRoom)}
              >
                +
              </Button>
            </div>

            {showCreateRoom && (
              <form onSubmit={handleCreateRoom} className="mb-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Room name"
                    value={roomNameInput}
                    onChange={(e) => setRoomNameInput(e.target.value)}
                    className="text-sm"
                  />
                  <Button type="submit" size="sm">
                    Create
                  </Button>
                </div>
              </form>
            )}

            <ScrollArea className="h-32">
              <div className="space-y-1">
                {rooms.map((room) => (
                  <Button
                    key={room.id}
                    variant={activeRoomId === room.id ? "default" : "ghost"}
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => handleJoinRoom(room.id)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <MessageCircle className="w-4 h-4 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm">{room.name}</p>
                        {room.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs ml-2">
                            {room.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Users */}
          <UserList
            users={users}
            currentUserId={currentUser.id}
            onStartPrivateChat={handleStartPrivateChat}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <h2 className="font-semibold">{activeRoom.name}</h2>
                {activeRoom.isPrivate && <Badge variant="secondary">Private</Badge>}
                <Badge variant="outline" className="ml-auto">
                  <Users className="w-3 h-3 mr-1" />
                  {activeRoom.participants?.length || 0}
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <ChatArea messages={messages} currentUserId={currentUser.id} />

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={!messageInput.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Card className="w-96">
              <CardHeader>
                <CardTitle className="text-center">Welcome to ChatFlow</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4">
                  Select a room or start a private chat to begin messaging.
                </p>
                <div className="flex justify-center gap-2">
                  <MessageCircle className="w-8 h-8 text-primary" />
                  <Users className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;