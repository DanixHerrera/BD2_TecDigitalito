import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { io } from 'socket.io-client';
import { messageService } from '../services/messageService';
import { useAuth } from './useAuth';

const fetchConversations = () => messageService.getConversations();

export function useConversation() {
  const { user } = useAuth();
  const currentUserId = user?.id?.toString() || user?._id?.toString() || null;

  const { data: conversations = [], mutate, isValidating } = useSWR(
    currentUserId ? '/api/messages/my-conversations' : null,
    fetchConversations
  );

  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!currentUserId) return;

    const socketUrl = import.meta.env.VITE_API_URL || ''; 
    const socket = io(socketUrl, {
      withCredentials: true,
      path: '/socket.io',
    });

    socket.on('connect', () => {
      console.log('Conectado a Socket.io en sala:', currentUserId);
      socket.emit('join', currentUserId);
    });

    socket.on('new_message', (updatedConversation) => {
      mutate();
      
      const convId = updatedConversation.id || updatedConversation['@metadata']?.['@id'];
      if (selected === convId) {
         setMessages(updatedConversation.messages || []);
      }
    });

    return () => socket.disconnect();
  }, [currentUserId, selected, mutate]);

  useEffect(() => {
    if (!selected) {
      setMessages([]);
      return;
    }

    messageService.getConversation(selected).then((conv) => {
      if (conv) setMessages(conv.messages || []);
    });
  }, [selected]);

  const sendMessage = async (text) => {
    if (!selected || !text.trim()) return;

    try {
      const payload = { text, conversationId: selected };
      const response = await messageService.sendMessage(payload);
      
      if (!response.ok) return;

      const conv = response.conversation;
      const msgs = conv?.messages || [];
      const newMsg = msgs.length > 0 ? msgs[msgs.length - 1] : { senderId: currentUserId, text, createdAt: new Date().toISOString() };
      
      setMessages((prev) => [...prev, newMsg]);
      mutate();
    } catch (error) {
      console.error('Error enviando mensaje', error);
    }
  };

  const startConversation = useCallback(async (userId) => {
    const existing = conversations.find((conversation) =>
      Array.isArray(conversation.participants) && conversation.participants.includes(userId)
    );

    if (existing) {
      const existingId = existing.id || existing['@metadata']?.['@id'];
      setSelected(existingId);
      return existing;
    }

    const fromServer = await messageService.startConversationWithUser(userId);
    if (fromServer) {
      const fromServerId = fromServer.id || fromServer['@metadata']?.['@id'];
      mutate(); 
      setSelected(fromServerId);
      return fromServer;
    }

    return null;
  }, [conversations, mutate]);

  return {
    conversations,
    messages,
    selected,
    setSelected,
    sendMessage,
    startConversation,
    loading: isValidating && conversations.length === 0,
    currentUserId,
  };
}
