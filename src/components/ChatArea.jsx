import { useState, useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Hash, Lock, ArrowDown } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';

const ChatArea = ({ roomName, isPrivate }) => {
  const { currentUser, messages, activeRoomId, sendMessage, addReaction, users } = useChat();
  const [messageInput, setMessageInput] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollAreaRef = useRef(null);
  const bottomRef = useRef(null);

  const roomMessages = messages.filter((m) => m.roomId === activeRoomId);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages.length]);

  const handleSend = (e) => {
    e.preventDefault();
    if (messageInput.trim() && currentUser) {
      sendMessage(messageInput, activeRoomId);
      setMessageInput('');
    }
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Get typing users
  const typingUsers = users.filter((u) => u.isTyping && u.id !== currentUser?.id);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-16 border-b border-border px-6 flex items-center justify-between bg-card shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center text-white">
            {isPrivate ? <Lock className="w-5 h-5" /> : <Hash className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="font-semibold text-foreground">{roomName}</h2>
            <p className="text-xs text-muted-foreground">
              {isPrivate ? 'Private conversation' : 'Public room'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 relative">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-6 space-y-2">
            {roomMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-2 animate-fade-in">
                  <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                    <Hash className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                </div>
              </div>
            ) : (
              <>
                {roomMessages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwnMessage={message.senderId === currentUser?.id}
                    onAddReaction={addReaction}
                  />
                ))}
                <div ref={bottomRef} />
              </>
            )}
          </div>
        </ScrollArea>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <Button
            size="icon"
            className="absolute bottom-4 right-4 rounded-full shadow-lg animate-bounce-subtle"
            onClick={scrollToBottom}
          >
            <ArrowDown className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-6 py-2 text-sm text-muted-foreground animate-fade-in">
          {typingUsers.map((u) => u.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'}{' '}
          typing
          <span className="inline-flex ml-1">
            <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
          </span>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            className="bg-gradient-primary hover:opacity-90 transition-opacity"
            disabled={!messageInput.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatArea;
