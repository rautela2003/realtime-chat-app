import React, { useState, useEffect, useRef } from 'react';
import TypingIndicator from './TypingIndicator';

function ChatRoom({ socket, username, room, onLeave }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [typingUsers, setTypingUsers] = useState(new Set());
    const typingTimeoutRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Listen for incoming messages
        socket.on('message', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        // Listen for typing indicators
        socket.on('typing', (user) => {
            setTypingUsers((prev) => {
                const newSet = new Set(prev);
                newSet.add(user);
                return newSet;
            });
        });

        socket.on('stopTyping', (user) => {
            setTypingUsers((prev) => {
                const newSet = new Set(prev);
                newSet.delete(user);
                return newSet;
            });
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
            socket.off('stopTyping');
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
            socket.emit('stopTyping', { username, room }); // Stop typing when sent

            setNewMessage('');
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);

        // Emit typing
        socket.emit('typing', { username, room });

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stopTyping', { username, room });
        }, 1500);
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

            <TypingIndicator typingUsers={Array.from(typingUsers)} />

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
