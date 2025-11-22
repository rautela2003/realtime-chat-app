import React, { useState, useEffect, useRef } from 'react';

function ChatRoom({ socket, username, room, onLeave }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [typing, setTyping] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Listen for incoming messages
        socket.on('message', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        // Listen for typing indicators
        socket.on('typing', (user) => {
            setTyping(`${user} is typing...`);
            setTimeout(() => setTyping(''), 3000);
        });

        // Load initial history (if available via API, or just start empty/from socket)
        // For this demo, we rely on real-time or could fetch from API
        fetch('http://localhost:3000/messages/latest')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setMessages(data);
            })
            .catch(err => console.error("Failed to load history", err));

        return () => {
            socket.off('message');
            socket.off('typing');
        };
    }, [socket]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            // Emit to server
            socket.emit('chatMessage', { username, text: newMessage, room });

            // Optimistically add to UI (optional, but server broadcasts back usually)
            // We'll wait for server broadcast to avoid duplicates if logic is simple

            setNewMessage('');
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        socket.emit('typing', username);
    };

    return (
        <div className="glass-card chat-container">
            <div className="chat-header">
                <h2>{room}</h2>
                <button onClick={onLeave} className="leave-btn">Leave</button>
            </div>

            <div className="messages-area">
                {messages.map((msg, index) => {
                    const isSystem = msg.username === 'System';
                    const isOwn = msg.username === username;

                    return (
                        <div
                            key={index}
                            className={`message ${isSystem ? 'system' : isOwn ? 'own' : 'other'}`}
                        >
                            {!isSystem && !isOwn && <span className="message-sender">{msg.username}</span>}
                            {msg.text}
                            {!isSystem && <span className="message-time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="typing-indicator">{typing}</div>

            <form className="chat-input-area" onSubmit={handleSend}>
                <input
                    type="text"
                    className="input-field"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={handleTyping}
                />
                <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0 2rem' }}>
                    Send
                </button>
            </form>
        </div>
    );
}

export default ChatRoom;
