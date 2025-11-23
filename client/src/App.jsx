import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import AuthScreen from './components/AuthScreen';
import JoinScreen from './components/JoinScreen';
import ChatRoom from './components/ChatRoom';

// Socket instance (initially disconnected)
const socket = io('http://localhost:3000', { autoConnect: false });

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [joined, setJoined] = useState(false);
  const [room, setRoom] = useState('');

  useEffect(() => {
    if (token) {
      // Authenticate socket
      socket.auth = { token };
      socket.connect();

      socket.on('connect_error', (err) => {
        console.error("Connection Error:", err.message);
        if (err.message.includes("Authentication error")) {
          handleLogout();
        }
      });
    }

    return () => {
      socket.off('connect_error');
      socket.disconnect();
    };
  }, [token]);

  const handleLogin = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setJoined(false);
    setRoom('');
    socket.disconnect();
  };

  const handleJoin = ({ room }) => {
    setRoom(room);
    setJoined(true);
    // Username is already in token/socket.user, but we send it for room join logic if needed
    // or just send room. Server knows who we are.
    socket.emit('joinRoom', { username: user.username, room });
  };

  const handleLeave = () => {
    setRoom('');
    // Keep socket connected, just leave UI room state
    // Ideally emit 'leaveRoom' event if we had one, or just rely on disconnect if we want to fully leave.
    // For now, let's keep it simple:
  };

  if (!token) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      {!joined ? (
        <JoinScreen onJoin={handleJoin} username={user.username} />
      ) : (
        <ChatRoom
          socket={socket}
          username={user.username}
          room={room}
          onLeave={handleLeave}
        />
      )}
      <button
        onClick={handleLogout}
        style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
      >
        Logout
      </button>
    </div>
  );
}

export default App;
