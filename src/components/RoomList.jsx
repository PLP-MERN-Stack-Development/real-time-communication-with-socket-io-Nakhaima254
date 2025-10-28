import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Hash, Lock, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export const RoomList = ({ rooms, activeRoomId, onSelectRoom, onCreateRoom }) => {
  const [open, setOpen] = useState(false);
  const [roomName, setRoomName] = useState('');

  const handleCreate = () => {
    if (roomName.trim()) {
      onCreateRoom(roomName.trim());
      setRoomName('');
      setOpen(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Rooms</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Room</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Room name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
              <Button onClick={handleCreate} className="w-full">
                Create Room
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {rooms.map((room) => (
            <Button
              key={room.id}
              variant={activeRoomId === room.id ? 'secondary' : 'ghost'}
              className={`w-full justify-start h-auto py-3 px-3 transition-colors ${
                activeRoomId === room.id ? 'bg-primary/10 hover:bg-primary/15' : 'hover:bg-muted/50'
              }`}
              onClick={() => onSelectRoom(room.id)}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  {room.isPrivate ? (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Hash className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="font-medium text-foreground truncate">{room.name}</div>
                  {room.lastMessage && (
                    <div className="text-xs text-muted-foreground truncate">
                      {room.lastMessage.content}
                    </div>
                  )}
                </div>
                {room.unreadCount > 0 && (
                  <Badge className="bg-primary text-primary-foreground">{room.unreadCount}</Badge>
                )}
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
