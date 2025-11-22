import React, { useState } from 'react';

function JoinScreen({ onJoin }) {
    const [username, setUsername] = useState('');
    const [room, setRoom] = useState('General');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username.trim() && room.trim()) {
            onJoin({ username, room });
        }
    };

    return (
        <div className="glass-card join-container">
            <h1 className="join-title">Join Chat</h1>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label className="input-label">Username</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label className="input-label">Room</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Enter room name"
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn-primary">
                    Join Room
                </button>
            </form>
        </div>
    );
}

export default JoinScreen;
