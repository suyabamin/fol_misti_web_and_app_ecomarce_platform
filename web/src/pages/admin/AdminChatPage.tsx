import React, { useEffect, useState, useRef } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  User,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  Filter,
  CheckCheck,
  Bot
} from 'lucide-react';
import { chatRepository } from '../../repositories/chatRepository';
import { SupportConversation, ChatMessage } from '../../models';
import { useAuth } from '../../context/AuthContext';

export const AdminChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all');
  const [sending, setSending] = useState(false);

  const { userProfile, currentUser } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    const list = await chatRepository.getAllConversations();
    setConversations(list);
    if (!selectedConvId && list.length > 0) {
      setSelectedConvId(list[0].id);
    }
  };

  useEffect(() => {
    loadConversations();

    const handleUpdate = () => loadConversations();
    window.addEventListener('folmishti_chat_updated', handleUpdate);
    return () => window.removeEventListener('folmishti_chat_updated', handleUpdate);
  }, []);

  useEffect(() => {
    if (!selectedConvId) return;

    chatRepository.markAsRead(selectedConvId, 'admin');

    const unsubscribe = chatRepository.subscribeMessages(selectedConvId, (msgs) => {
      setMessages(msgs);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, [selectedConvId]);

  const selectedConv = conversations.find(c => c.id === selectedConvId);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConvId || sending) return;

    setSending(true);
    try {
      await chatRepository.sendMessage(
        selectedConvId,
        currentUser?.uid || 'admin-master',
        userProfile?.displayName || 'সাপোর্ট ম্যানেজার',
        'admin',
        replyText.trim()
      );
      setReplyText('');
      loadConversations();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleToggleStatus = async (convId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'closed' ? 'open' : 'closed';
    await chatRepository.updateConversationStatus(convId, nextStatus);
    loadConversations();
  };

  const filteredConversations = conversations.filter(c => {
    if (filterStatus === 'open') return c.status !== 'closed';
    if (filterStatus === 'closed') return c.status === 'closed';
    return true;
  });

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
          লাইভ সাপোর্ট ইনবক্স (Customer Live Support)
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          গ্রাহকদের সাথে সরাসরি রিয়েল-টাইম চ্যাট বার্তা বিনিময় করুন
        </p>
      </div>

      <div
        style={{
          flex: 1,
          background: '#fff',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '320px 1fr 280px',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        {/* Left Col: Conversation List */}
        <div style={{ borderRight: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', background: 'var(--color-surface)' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <button
                className={`btn ${filterStatus === 'all' ? 'btn-primary' : 'btn-subtle'} btn-sm`}
                onClick={() => setFilterStatus('all')}
                style={{ flex: 1, padding: '0.35rem' }}
              >
                সকল
              </button>
              <button
                className={`btn ${filterStatus === 'open' ? 'btn-primary' : 'btn-subtle'} btn-sm`}
                onClick={() => setFilterStatus('open')}
                style={{ flex: 1, padding: '0.35rem' }}
              >
                সক্রিয়
              </button>
              <button
                className={`btn ${filterStatus === 'closed' ? 'btn-primary' : 'btn-subtle'} btn-sm`}
                onClick={() => setFilterStatus('closed')}
                style={{ flex: 1, padding: '0.35rem' }}
              >
                বন্ধ
              </button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredConversations.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                কোনো বার্তা পাওয়া যায়নি।
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isSelected = c.id === selectedConvId;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedConvId(c.id)}
                    style={{
                      padding: '1rem',
                      borderBottom: '1px solid var(--color-border-subtle)',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--color-primary-light)' : '#fff',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '0.95rem', color: isSelected ? 'var(--color-primary)' : 'var(--color-text)' }}>
                        {c.userName}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {new Date(c.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.lastMessageText || 'বার্তা পাঠানো হয়েছে'}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                      <span className={`badge ${c.status === 'closed' ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '0.7rem' }}>
                        {c.status === 'closed' ? 'বন্ধ' : 'সক্রিয়'}
                      </span>
                      {c.unreadCountAdmin > 0 && (
                        <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                          {c.unreadCountAdmin} টি নতুন
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center Col: Active Messages Thread */}
        <div style={{ display: 'flex', flexDirection: 'column', background: '#fafbfa' }}>
          {selectedConv ? (
            <>
              {/* Thread Header */}
              <div style={{ padding: '0.85rem 1.25rem', background: '#fff', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', margin: 0 }}>{selectedConv.userName}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600 }}>● লাইভ সেশন চালু আছে</span>
                </div>

                <button
                  onClick={() => handleToggleStatus(selectedConv.id, selectedConv.status)}
                  className="btn btn-subtle btn-sm"
                >
                  {selectedConv.status === 'closed' ? 'পুনরায় খুলুন' : 'চ্যাট বন্ধ করুন'}
                </button>
              </div>

              {/* Messages Area */}
              <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {messages.map((m) => {
                  const isAdmin = m.senderRole === 'admin';
                  return (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: isAdmin ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '0.2rem', textAlign: isAdmin ? 'right' : 'left' }}>
                        {m.senderName}
                      </span>
                      <div
                        style={{
                          background: isAdmin ? 'var(--color-primary)' : '#fff',
                          color: isAdmin ? '#fff' : 'var(--color-text)',
                          border: isAdmin ? 'none' : '1px solid var(--color-border)',
                          padding: '0.65rem 0.9rem',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.9rem',
                          lineHeight: 1.4,
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        {m.text}
                      </div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', marginTop: '0.2rem', textAlign: isAdmin ? 'right' : 'left' }}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Input Box */}
              <form onSubmit={handleSendReply} style={{ padding: '0.85rem 1.25rem', background: '#fff', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '0.75rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="গ্রাহককে উত্তর লিখুন..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  disabled={sending}
                  style={{ borderRadius: 'var(--radius-full)' }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!replyText.trim() || sending}
                  style={{ borderRadius: 'var(--radius-full)', padding: '0.6rem 1.25rem' }}
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <Bot size={48} style={{ margin: '0 auto 1rem', color: 'var(--color-primary)' }} />
              <p>বাম পাশ থেকে কোনো কথোপকথন নির্বাচন করুন।</p>
            </div>
          )}
        </div>

        {/* Right Col: Customer Profile Sidebar */}
        <div style={{ borderLeft: '1px solid var(--color-border)', padding: '1.5rem', background: '#fff', overflowY: 'auto' }}>
          {selectedConv ? (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--color-border-subtle)' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, margin: '0 auto 0.75rem' }}>
                  {selectedConv.userName.charAt(0)}
                </div>
                <h4 style={{ fontSize: '1.1rem', margin: '0 0 0.25rem' }}>{selectedConv.userName}</h4>
                <span className="badge badge-subtle">অনলাইন গ্রাহক</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>ইমেইল:</span>
                  <strong>{selectedConv.userEmail || 'প্রদত্ত হয়নি'}</strong>
                </div>

                <div>
                  <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>মোবাইল:</span>
                  <strong>{selectedConv.userPhone || 'চ্যাটে সক্রিয়'}</strong>
                </div>

                <div>
                  <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>চ্যাট আইডি:</span>
                  <code>{selectedConv.id}</code>
                </div>

                <div>
                  <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>শুরু তারিখ:</span>
                  <span>{new Date(selectedConv.createdAt).toLocaleString('bn-BD')}</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem' }}>
              গ্রাহকের তথ্য এখানে প্রদর্শিত হবে
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
