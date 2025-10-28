import { User } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle } from 'lucide-react';

const UserList = ({ users, currentUserId, onStartPrivateChat }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-foreground">Online Users ({users.length})</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {users.map((user) => (
            <Button
              key={user.id}
              variant="ghost"
              className="w-full justify-start h-auto py-3 px-3 hover:bg-muted/50 transition-colors"
              onClick={() => onStartPrivateChat(user.id)}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold shadow-md">
                    {user.avatar}
                  </div>
                  <div
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${
                      user.isOnline ? 'bg-online' : 'bg-offline'
                    }`}
                  />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-foreground">{user.username}</div>
                  {user.isTyping && (
                    <div className="text-xs text-primary animate-pulse">typing...</div>
                  )}
                  {!user.isTyping && !user.isOnline && (
                    <div className="text-xs text-muted-foreground">
                      {new Date(user.lastSeen).toLocaleTimeString()}
                    </div>
                  )}
                </div>
                <MessageCircle className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default UserList;
