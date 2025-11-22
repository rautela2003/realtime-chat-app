import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import JoinScreen from './components/JoinScreen';
import ChatRoom from './components/ChatRoom';

const socket = io('http://localhost:3000');

function App() {
  const [joined, setJoined] = useState(false);
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');

  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleJoin = ({ username, room }) => {
    setUsername(username);
    setRoom(room);
    setJoined(true);
    socket.emit('joinRoom', { username, room });
  };

  const handleLeave = () => {
    setJoined(false);
    setUsername('');
    setRoom('');
    socket.disconnect();
    socket.connect(); // Reconnect for fresh state
  };

  return (
    <div className="app">
      {!joined ? (
        <JoinScreen onJoin={handleJoin} />
      ) : (
        <ChatRoom
          socket={socket}
          username={username}
          room={room}
          onLeave={handleLeave}
        />
      )}
    </div>
  );
}

export default App;
