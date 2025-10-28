import { useState } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { ChatArea } from './ChatArea';
import { UserList } from './UserList';
import { RoomList } from './RoomList';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X, Volume2, VolumeX, Wifi, WifiOff } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export const ChatLayout = () => {
  const {
    currentUser,
    users,
    rooms,
    activeRoomId,
    logout,
    createRoom,
    setActiveRoom,
    startPrivateChat,
    soundEnabled,
    toggleSound,
    isConnected,
  } = useChat();

  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  const activeRoom = rooms.find((r) => r.id === activeRoomId);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="h-14 border-b border-border bg-card px-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          {/* Mobile menu buttons */}
          <Sheet open={leftSidebarOpen} onOpenChange={setLeftSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <div className="h-full flex flex-col">
                <div className="flex-1">
                  <RoomList
                    rooms={rooms}
                    activeRoomId={activeRoomId}
                    onSelectRoom={(id) => {
                      setActiveRoom(id);
                      setLeftSidebarOpen(false);
                    }}
                    onCreateRoom={createRoom}
                  />
                </div>
                <div className="flex-1 border-t border-border">
                  <UserList
                    users={users}
                    currentUserId={currentUser?.id || ''}
                    onStartPrivateChat={(id) => {
                      startPrivateChat(id);
                      setLeftSidebarOpen(false);
                    }}
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-bold text-sm">
              CF
            </div>
            <span className="font-bold text-foreground hidden sm:inline">ChatApp</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Connection status */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-success" />
                <span className="text-xs text-success hidden sm:inline">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-destructive" />
                <span className="text-xs text-destructive hidden sm:inline">Disconnected</span>
              </>
            )}
          </div>

          {/* Sound toggle */}
          <Button variant="ghost" size="icon" onClick={toggleSound}>
            {soundEnabled ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </Button>

          {/* User profile */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted">
            <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-semibold">
              {currentUser?.avatar}
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:inline">
              {currentUser?.username}
            </span>
          </div>

          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Desktop */}
        <div className="hidden lg:flex w-80 border-r border-border bg-card flex-col">
          <div className="flex-1 overflow-hidden">
            <RoomList
              rooms={rooms}
              activeRoomId={activeRoomId}
              onSelectRoom={setActiveRoom}
              onCreateRoom={createRoom}
            />
          </div>
          <div className="flex-1 border-t border-border overflow-hidden">
            <UserList
              users={users}
              currentUserId={currentUser?.id || ''}
              onStartPrivateChat={startPrivateChat}
            />
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex-1 overflow-hidden">
          {activeRoom && <ChatArea roomName={activeRoom.name} isPrivate={activeRoom.isPrivate} />}
        </div>
      </div>
    </div>
  );
};
