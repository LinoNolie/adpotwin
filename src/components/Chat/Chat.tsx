import React, { memo, useRef, useEffect, useCallback } from 'react';
import './Chat.css';

interface ChatMessage {
  text: string;
  user?: string;
  type?: 'system' | 'user' | 'winner';
}

interface ChatProps {
  messages: Array<{
    text: string;
    user?: string;
    type?: 'system' | 'user' | 'winner';
  }>;
  isLoggedIn: boolean;
  chatInput: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  winnerMessage?: {
    username: string;
    amount: number;
    potType: string;
  } | null;
  rateLimit?: {
    remaining: number;
    resetTime: number;
  };
}

export const Chat = memo(({ 
  messages, 
  isLoggedIn, 
  chatInput, 
  onInputChange, 
  onSubmit,
  winnerMessage,
  rateLimit = { remaining: 5, resetTime: 0 } // Add default value
}: ChatProps) => {
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = React.useState(false);

  const scrollToBottom = useCallback(() => {
    if (chatMessagesRef.current && !isUserScrolling) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [isUserScrolling]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, winnerMessage, scrollToBottom]);

  const handleScroll = useCallback(() => {
    const chatDiv = chatMessagesRef.current;
    if (!chatDiv) return;
    
    const isAtBottom = chatDiv.scrollHeight - chatDiv.scrollTop <= chatDiv.clientHeight + 100;
    setIsUserScrolling(!isAtBottom);
  }, []);

  const getRateLimitInfo = () => {
    if (rateLimit.remaining === 0) {
      const waitTime = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return `Wait ${waitTime}s`;
    }
    return `${rateLimit.remaining} messages left`;
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>User Chat</h3>
        <span className="online-users">423 online</span>
      </div>
      
      <div 
        className="chat-messages" 
        ref={chatMessagesRef}
        onScroll={handleScroll}
      >
        <div className="message-wrapper system">
          <p>
            {isLoggedIn 
              ? 'Welcome! Watch ads and earn rewards.' 
              : 'Please log in to participate.'}
          </p>
        </div>
        
        {messages.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.type || ''}`}>
            {msg.user && <span className="chat-username">{msg.user}: </span>}
            <span className="chat-text">{msg.text}</span>
          </div>
        ))}

        {winnerMessage && (
          <div className="message-wrapper winner-message">
            <div className="winner-content">
              <img src="/assets/logo.png" alt="" className="winner-logo" />
              <span>
                <span className="winner-name">{winnerMessage.username}</span> won
                <span className="winner-amount">${winnerMessage.amount.toLocaleString()}</span> 
                from the {winnerMessage.potType} pot!
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-wrapper">
        <div className="rate-limit-indicator">
          <div 
            className="rate-limit-bar"
            style={{ 
              width: `${(rateLimit.remaining / 5) * 100}%`,
              backgroundColor: rateLimit.remaining === 0 ? '#f8d7da' : '#d4edda'
            }}
          />
          <span className="rate-limit-text">{getRateLimitInfo()}</span>
        </div>
        <form 
          className="chat-input" 
          onSubmit={onSubmit}
        >
          <input
            type="text"
            value={chatInput}
            onChange={onInputChange}
            placeholder={isLoggedIn ? "Type a message..." : "Please log in to chat"}
            disabled={!isLoggedIn || rateLimit.remaining === 0}
            maxLength={200}
            aria-label="Chat input"
          />
          <button 
            type="submit" 
            disabled={!isLoggedIn || !chatInput.trim() || rateLimit.remaining === 0}
            aria-label="Send message"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
});

Chat.displayName = 'Chat';

export default Chat;
