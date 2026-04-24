import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useFriends } from '../../hooks/useFriends';
import { useConversation } from '../../hooks/useConversation';
import { socialService } from '../../services/socialService';
import '@/styles/Social.css';

export default function Friends() {
  const [activeTab, setActiveTab] = useState('amigos');
  const { friends, requests, loading, acceptRequest, rejectRequest, removeFriend, sendRequest } = useFriends();
  const { startConversation } = useConversation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Buscar automaticamente al entrar a la pestaña o al escribir
  useEffect(() => {
    if (activeTab === 'buscar') {
      const performSearch = async () => {
        setIsSearching(true);
        try {
          const results = await socialService.searchUsers(searchQuery);
          setSearchResults(results || []);
        } catch (error) {
          console.error(error);
        } finally {
          setIsSearching(false);
        }
      };

      const debounce = setTimeout(performSearch, 300);
      return () => clearTimeout(debounce);
    }
  }, [activeTab, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleMessage = async (userId) => {
    await startConversation(userId);
    navigate('/social/user-messages');
  };

  const tabs = [
    { id: 'amigos', label: 'Mis Amigos' },
    { id: 'solicitudes', label: 'Solicitudes', badge: requests.length > 0 ? requests.length : null },
    { id: 'buscar', label: 'Buscar Usuarios' }
  ];

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">Red Social</h1>
      </header>

      <div className="page-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`page-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.badge && <span className="social-badge">{tab.badge}</span>}
          </button>
        ))}
      </div>

      {loading && <div>Cargando...</div>}

      {!loading && activeTab === 'amigos' && (
        <div className="friends-grid">
          {friends.map(friend => (
            <div key={friend.userId} className="card card-horizontal">
              <button
                className="friend-remove-btn"
                title="Eliminar amigo"
                onClick={() => removeFriend(friend.userId)}
              >
                ✕
              </button>
              <div className="avatar avatar-md">
                {friend.fullName ? friend.fullName.substring(0, 2).toUpperCase() : friend.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="friend-info">
                <div className="friend-name">{friend.fullName || friend.username}</div>
                <div className="friend-email">{friend.email}</div>
              </div>
              <div className="friend-actions">
                <button className="btn btn-outline" onClick={() => handleMessage(friend.userId)}>
                  Mensaje
                </button>
                <button className="btn btn-primary">
                  Cursos
                </button>
              </div>
            </div>
          ))}
          {friends.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--muted-foreground)' }}>
              No tienes amigos agregados aún. Ve a "Buscar Usuarios" para conectarte.
            </div>
          )}
        </div>
      )}

      {!loading && activeTab === 'solicitudes' && (
        <div className="request-list">
          {requests.map(req => (
            <div key={req.userId} className="card card-horizontal">
              <div className="avatar avatar-md">
                {req.user?.fullName?.substring(0, 2).toUpperCase() || req.username?.substring(0, 2).toUpperCase() || 'U'}
              </div>
              <div className="request-info">
                <div className="request-name">{req.user?.fullName || req.username}</div>
                <div className="request-date">
                  Enviada el {new Date(req.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="request-actions">
                <button
                  className="btn btn-outline"
                  style={{ padding: '0.4rem 1rem' }}
                  onClick={() => rejectRequest(req.userId)}
                >
                  Rechazar
                </button>
                <button
                  className="btn btn-primary"
                  style={{ padding: '0.4rem 1rem' }}
                  onClick={() => acceptRequest(req.userId)}
                >
                  Aceptar
                </button>
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted-foreground)' }}>
              No tienes solicitudes pendientes.
            </div>
          )}
        </div>
      )}

      {activeTab === 'buscar' && (
        <div>
          <form className="search-container" onSubmit={handleSearch}>
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por nombre, usuario o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {isSearching ? (
            <div>Buscando...</div>
          ) : (
            <div className="friends-grid">
              {searchResults.map(user => {
                const isFriend = friends.some(f => f.userId === user._id || f.userId === user.userId);
                return (
                  <div key={user._id || user.userId} className="card card-horizontal">
                    <div className="avatar avatar-md">
                      {user.fullName ? user.fullName.substring(0, 2).toUpperCase() : user.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="friend-info">
                      <div className="friend-name">{user.fullName || user.username}</div>
                      <div className="friend-email">{user.email}</div>
                    </div>
                    <div className="friend-actions">
                      {isFriend ? (
                        <button className="btn btn-outline" disabled style={{ opacity: 0.6 }}>Siguiendo</button>
                      ) : (
                        <button className="btn btn-primary" onClick={() => sendRequest(user._id || user.userId)}>
                          Seguir
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {searchResults.length === 0 && !isSearching && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--muted-foreground)' }}>
                  {searchQuery ? "No se encontraron usuarios." : "Cargando directorio de usuarios..."}
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
