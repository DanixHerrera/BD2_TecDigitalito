import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router';
import { useConversation } from '../../hooks/useConversation';
import '@/styles/Social.css';

export default function UserMessages() {
  const location = useLocation();
  const { conversations, messages, selected, setSelected, sendMessage, startConversation, loading, currentUserId } = useConversation();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  // Para responsive
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Si venimos de un curso con un contactUserId, iniciar la conversacion con él
  useEffect(() => {
    if (!loading && location.state?.contactUserId) {
      startConversation(location.state.contactUserId);
      // Limpiamos el state para que no se re-dispare si el usuario navega
      window.history.replaceState({}, document.title);
    }
  }, [loading, location.state, startConversation]);

  const handleSend = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText('');
    }
  };

  const handleSelectConv = (id) => {
    setSelected(id);
    setIsMobileListVisible(false);
  };

  if (loading) return <div className="social-page-container">Cargando...</div>;

  const currentConv = conversations.find(c => c.id === selected || c['@metadata']?.['@id'] === selected);
  const otherParticipantId = currentConv ? currentConv.participants.find(p => p !== currentUserId) : null;
  const otherParticipantName = currentConv && currentConv.participantNames && otherParticipantId
    ? currentConv.participantNames[otherParticipantId]
    : 'Contacto';
  const otherParticipantInitials = otherParticipantName.substring(0, 2).toUpperCase();

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">Mensajes</h1>
      </header>

      <div className="messages-layout">

        {/* Panel izquierdo: Lista */}
        <div className={`conversation-list ${!isMobileListVisible ? 'hidden-mobile' : ''}`}>
          <div className="conversation-header">
            <h2 className="conversation-title">Mensajes Directos</h2>
            <div className="search-container" style={{ marginBottom: 0 }}>
              <input type="text" className="search-input" placeholder="Buscar..." />
            </div>
          </div>

          <div className="conversation-items">
            {conversations.map(conv => {
              const convId = conv.id || conv['@metadata']?.['@id'];
              const otherId = conv.participants.find(p => p !== currentUserId);
              const name = conv.participantNames?.[otherId] || 'Usuario';
              const lastMsg = conv.messages && conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null;
              const preview = lastMsg ? lastMsg.text : '...';

              return (
                <div
                  key={convId}
                  className={`conversation-item ${selected === convId ? 'active' : ''}`}
                  onClick={() => handleSelectConv(convId)}
                >
                  <div className="avatar avatar-md">
                    {name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-name">{name}</div>
                    <div className="conversation-preview">{preview}</div>
                  </div>
                </div>
              );
            })}
            {conversations.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                No hay conversaciones
              </div>
            )}
          </div>
        </div>

        {/* Panel derecho: Chat */}
        <div className={`chat-area ${!isMobileListVisible ? 'active-mobile' : ''}`}>
          {selected ? (
            <>
              <div className="chat-header">
                <button className="chat-back-btn" onClick={() => setIsMobileListVisible(true)}>
                  &larr; Volver
                </button>
                <div className="avatar avatar-sm">
                  {otherParticipantInitials}
                </div>
                <div className="conversation-name" style={{ marginBottom: 0 }}>
                  {otherParticipantName}
                </div>
              </div>

              <div className="chat-messages">
                {messages.map((msg, i) => {
                  const isMine = msg.senderId === currentUserId;
                  const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={i} className={`message-wrapper ${isMine ? 'sent' : 'received'}`}>
                      <div className="message-bubble">{msg.text}</div>
                      <div className="message-time">{time}</div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form className="chat-input-area" onSubmit={handleSend}>
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Escribe un mensaje..."
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                />
                <button type="submit" className="chat-send-btn" disabled={!inputText.trim()}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </form>
            </>
          ) : (
            <div className="empty-chat">
              Selecciona una conversacion para empezar a mensajear
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
