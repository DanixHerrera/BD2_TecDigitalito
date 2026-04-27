import { useState, useEffect } from 'react';
import { socialService } from '../services/socialService';

export function useFriends() {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    Promise.all([
      socialService.getFriends(),
      socialService.getRequests()
    ]).then(([f, r]) => {
      setFriends(f || []);
      setRequests(r || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  const acceptRequest = async (userId) => {
    try {
      await socialService.acceptRequest(userId);
      refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const rejectRequest = async (userId) => {
    try {
      await socialService.rejectRequest(userId);
      refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const removeFriend = async (id) => {
    try {
      await socialService.removeFriend(id);
      refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const sendRequest = async (userId) => {
    try {
      const response = await socialService.sendRequest(userId);
      if (!response?.ok) {
        throw new Error(response?.message || 'No se pudo enviar la solicitud');
      }
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return { friends, requests, loading, acceptRequest, rejectRequest, removeFriend, sendRequest, refresh };
}
