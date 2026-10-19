import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Minus, Bot, User, PhoneCall, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { chatRepository } from '../repositories/chatRepository';
import { SupportConversation, ChatMessage } from '../models';
import './CustomerLiveChat.css';

export const CustomerLiveChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const { currentUser, userProfile } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const guestId = useRef(
    (() => {
      let id = localStorage.getItem('folmishti_guest_chat_id');
      if (!id) {
        id = `guest-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('folmishti_guest_chat_id', id);
      }
      return id;
    })()
  ).current;

  const currentUserId = currentUser?.uid || guestId;
  const currentUserName = userProfile?.displayName || (currentUser?.displayName) || 'সম্মানিত অতিথি';

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function initChat() {
      try {
        const conv = await chatRepository.getOrCreateConversation(
          currentUserId,
          currentUserName,
          currentUser?.email || undefined,
          userProfile?.phone || undefined
        );
        setConversation(conv);

        unsubscribe = chatRepository.subscribeMessages(conv.id, (msgs) => {
          setMessages(msgs);
          scrollToBottom();
        });
      } catch (err) {
        console.error('Failed to initialize chat:', err);
      }
    }

    if (isOpen) {
      initChat();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isOpen, currentUserId, currentUserName, currentUser?.email, userProfile?.phone]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || inputText;
    if (!textToSend.trim() || !conversation || isSending) return;

    setIsSending(true);
    try {
      await chatRepository.sendMessage(
        conversation.id,
        currentUserId,
        currentUserName,
        'customer',
        textToSend.trim()
      );
      if (!customText) setInputText('');
      scrollToBottom();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const quickPrompts = [
    'ঢাকার মধ্যে ডেলিভারি সময় কতক্ষণ?',
    'ক্যাশ অন ডেলিভারিতে কীভাবে পেমেন্ট করবো?',
    'আমের সিজনাল অফার কি চলছে?'
  ];

  return (
    <div className="customer-chat-container">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          className="chat-toggle-btn"
          onClick={() => setIsOpen(true)}
          aria-label="কাস্টমার সাপোর্ট চ্যাট"
        >
          <div className="chat-badge-dot"></div>
          <MessageSquare size={26} />
          <span className="chat-btn-label">লাইভ সাপোর্ট</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar-wrap">
                <span className="chat-avatar-symbol">🥭</span>
                <span className="online-indicator"></span>
              </div>
              <div className="chat-header-text">
                <h4 className="chat-header-title">ফল মিষ্টি সাপোর্ট</h4>
                <span className="chat-header-status">অনলাইন • তাৎক্ষণিক উত্তর</span>
              </div>
            </div>
            <div className="chat-header-actions">
              <button
                className="chat-header-btn"
                onClick={() => setIsOpen(false)}
                title="মিনিমাইজ করুন"
              >
                <Minus size={18} />
              </button>
              <button
                className="chat-header-btn"
                onClick={() => setIsOpen(false)}
                title="বন্ধ করুন"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Hotline Banner */}
          <div className="chat-hotline-banner">
            <PhoneCall size={14} />
            <span>জরুরি প্রয়োজনে কল করুন: <strong>০১৭১২-৩৪৫৬৭৮</strong></span>
          </div>

          {/* Messages Area */}
          <div className="chat-messages-area">
            {messages.length === 0 ? (
              <div className="chat-empty-state">
                <Bot size={36} className="chat-empty-icon" />
                <p>আসসালামু আলাইকুম! কোনো প্রশ্ন থাকলে এখনই মেসেজ পাঠান।</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderRole === 'customer';
                return (
                  <div
                    key={msg.id}
                    className={`chat-bubble-wrap ${isMe ? 'chat-bubble-me' : 'chat-bubble-support'}`}
                  >
                    {!isMe && (
                      <span className="bubble-sender-name">কাস্টমার কেয়ার</span>
                    )}
                    <div className="chat-bubble">
                      <p className="bubble-text">{msg.text}</p>
                      <span className="bubble-time">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Chips */}
          <div className="chat-quick-chips">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                type="button"
                className="quick-chip"
                onClick={() => handleSendMessage(undefined, q)}
              >
                <Sparkles size={12} />
                <span>{q}</span>
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form className="chat-input-area" onSubmit={handleSendMessage}>
            <input
              type="text"
              className="chat-input"
              placeholder="আপনার প্রশ্ন লিখুন..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isSending}
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={!inputText.trim() || isSending}
              aria-label="পাঠান"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
