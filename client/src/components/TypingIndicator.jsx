import React from 'react';

function TypingIndicator({ typingUsers }) {
    if (!typingUsers || typingUsers.length === 0) {
        return null;
    }

    let text = '';
    if (typingUsers.length === 1) {
        text = `${typingUsers[0]} is typing...`;
    } else if (typingUsers.length === 2) {
        text = `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
    } else {
        text = `${typingUsers[0]}, ${typingUsers[1]} and ${typingUsers.length - 2} others are typing...`;
    }

    return (
        <div className="typing-indicator" style={{
            padding: '0 1.5rem 0.5rem',
            fontSize: '0.875rem',
            color: '#94a3b8',
            fontStyle: 'italic',
            height: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        }}>
            <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
            {text}
        </div>
    );
}

export default TypingIndicator;
