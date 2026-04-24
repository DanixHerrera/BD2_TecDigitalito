import { useState, useEffect } from 'react';
import { messageService } from '../services/messageService';

export function useConversation() {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentUserId, setCurrentUserId] = useState('current-user');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.userId) setCurrentUserId(payload.userId);
      } catch (e) {
        console.error("Error decoding token", e);
      }
    }

    messageService.getConversations()
      .then(setConversations)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    messageService.getConversation(selected).then(conv => {
      if (conv) {
        setMessages(conv.messages || []);
      }
    });
  }, [selected]);

  const sendMessage = async (text) => {
    if (!selected || !text.trim()) return;
    try {
      const isOptimistic = selected.startsWith('conv-new-');
      const payload = { text };
      
      if (isOptimistic) {
        // Obtenemos el receiverId del id optimista
        payload.receiverId = selected.replace('conv-new-', '');
      } else {
        payload.conversationId = selected;
      }

      const response = await messageService.sendMessage(payload);
      if (response.ok || response.message === 'Mensaje enviado') {
        const newMsg = response.data || response.message_data || { senderId: currentUserId, text, createdAt: new Date().toISOString() };
        setMessages(prev => [...prev, newMsg]);

        if (isOptimistic && response.conversation) {
          // Reemplazar la conversación optimista por la real devuelta por el servidor
          setConversations(prev => prev.map(c => 
            c.id === selected ? response.conversation : c
          ));
          setSelected(response.conversation.id || response.conversation['@metadata']?.['@id']);
        } else {
          setConversations(prev => prev.map(c => 
            c.id === selected 
              ? { ...c, updatedAt: new Date().toISOString() } 
              : c
          ));
        }
      }
    } catch (error) {
      console.error('Error enviando mensaje', error);
    }
  };

  const startConversation = async (userId) => {
    const existing = conversations.find(c => c.participants.includes(userId));
    if (existing) {
      setSelected(existing.id || existing['@metadata']?.['@id']);
      return existing;
    } else {
      // Intentar buscar en el backend si existe (por si se creó desde otro dispositivo)
      const fromServer = await messageService.startConversationWithUser(userId);
      if (fromServer) {
        setConversations(prev => {
          if (!prev.find(c => c.id === fromServer.id || c['@metadata']?.['@id'] === fromServer['@metadata']?.['@id'])) {
            return [fromServer, ...prev];
          }
          return prev;
        });
        setSelected(fromServer.id || fromServer['@metadata']?.['@id']);
        return fromServer;
      }

      // Crear conversación optimista vacía
      const newConvId = `conv-new-${userId}`;
      const newConv = {
        id: newConvId,
        participants: [currentUserId, userId],
        participantNames: { [userId]: 'Usuario ' + userId },
        messages: [],
        updatedAt: new Date().toISOString()
      };
      setConversations(prev => [newConv, ...prev]);
      setSelected(newConvId);
      return newConv;
    }
  };

  return { conversations, messages, selected, setSelected, sendMessage, startConversation, loading, currentUserId };
}
