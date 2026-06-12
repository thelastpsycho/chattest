import { ChatMessage } from '@/lib/types';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isGuest = message.role === 'guest';
  const time = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`flex ${isGuest ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isGuest
            ? 'bg-[var(--anvaya-teal)] text-white rounded-br-sm'
            : 'bg-[var(--anvaya-white)] text-[var(--anvaya-charcoal)] border border-[var(--anvaya-light-gray)] rounded-bl-sm shadow-sm'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap m-0">{message.content}</p>
        <span
          className={`text-xs mt-2 block opacity-70 ${
            isGuest ? 'text-white' : 'text-[var(--anvaya-charcoal)]'
          }`}
        >
          {time}
        </span>
      </div>
    </div>
  );
}
