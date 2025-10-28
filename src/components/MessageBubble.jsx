import { Message } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮'];

export const MessageBubble = ({ message, isOwnMessage, onAddReaction }) => {
  if (message.isSystem) {
    return (
      <div className="flex justify-center my-4 animate-fade-in">
        <div className="text-xs text-muted-foreground italic bg-muted/30 px-3 py-1 rounded-full">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex gap-3 mb-4 animate-fade-in group',
        isOwnMessage ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold shadow-md">
          {message.senderAvatar}
        </div>
      </div>

      <div className={cn('flex flex-col gap-1 max-w-[70%]', isOwnMessage ? 'items-end' : 'items-start')}>
        {!isOwnMessage && (
          <span className="text-xs font-medium text-foreground px-1">{message.senderName}</span>
        )}
        
        <div
          className={cn(
            'rounded-2xl px-4 py-2 shadow-sm',
            isOwnMessage
              ? 'bg-chat-sent text-primary-foreground rounded-tr-sm'
              : 'bg-chat-received text-foreground rounded-tl-sm'
          )}
        >
          <p className="text-sm break-words">{message.content}</p>
        </div>

        <div className="flex items-center gap-2 px-1">
          <span className="text-xs text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </span>
          
          {/* Reaction buttons - show on hover */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            {REACTION_EMOJIS.map((emoji) => (
              <Button
                key={emoji}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 hover:scale-125 transition-transform"
                onClick={() => onAddReaction(message.id, emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>

        {/* Display reactions */}
        {message.reactions.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {Object.entries(
              message.reactions.reduce((acc, r) => {
                acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                return acc;
              }, {})
            ).map(([emoji, count]) => (
              <button
                key={emoji}
                className="inline-flex items-center gap-1 bg-muted hover:bg-muted/80 rounded-full px-2 py-0.5 text-xs transition-colors"
                onClick={() => onAddReaction(message.id, emoji)}
              >
                <span>{emoji}</span>
                <span className="text-muted-foreground">{count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
