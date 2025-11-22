const socket = io();

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const chatContainer = document.getElementById('chat-container');
const usernameInput = document.getElementById('username-input');
const joinBtn = document.getElementById('join-btn');
const chatForm = document.getElementById('chat-form');
const msgInput = document.getElementById('msg-input');
const messagesDiv = document.getElementById('messages');
const usersList = document.getElementById('users-list');
const typingIndicator = document.getElementById('typing-indicator');

let username = '';
let typingTimeout;

// Join Chat
joinBtn.addEventListener('click', () => {
    username = usernameInput.value.trim();
    if (username) {
        loginScreen.classList.add('hidden');
        chatContainer.classList.remove('hidden');

        // Emit join event
        socket.emit('joinRoom', { username });

        // Load recent messages
        fetchMessages();
    } else {
        alert('Please enter a username');
    }
});

// Send Message
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = msgInput.value.trim();

    if (text) {
        // Emit message to server
        socket.emit('chatMessage', { username, text });

        // Clear input
        msgInput.value = '';
        msgInput.focus();
    }
});

// Typing Indicator
msgInput.addEventListener('input', () => {
    socket.emit('typing', username);
});

// Socket Events

// Receive Message
socket.on('message', (message) => {
    outputMessage(message);

    // Scroll to bottom
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Typing Event
socket.on('typing', (user) => {
    typingIndicator.innerText = `${user} is typing...`;

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        typingIndicator.innerText = '';
    }, 3000);
});

// Update Users List
socket.on('online-users', (users) => {
    outputUsers(users);
});

// Helper Functions

function outputMessage(message) {
    const div = document.createElement('div');
    const isSystem = message.username === 'System';
    const isMe = message.username === username;

    if (isSystem) {
        div.classList.add('message', 'system');
        div.innerHTML = `<p>${message.text}</p>`;
    } else {
        div.classList.add('message');
        div.classList.add(isMe ? 'sent' : 'received');

        const time = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        div.innerHTML = `
            <div class="meta">${isMe ? 'You' : message.username} <span>${time}</span></div>
            <p class="text">${message.text}</p>
        `;
    }

    messagesDiv.appendChild(div);
}

function outputUsers(users) {
    usersList.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        li.innerText = user;
        usersList.appendChild(li);
    });
}

async function fetchMessages() {
    try {
        const res = await fetch('/messages/latest');
        const messages = await res.json();

        messages.forEach(msg => {
            outputMessage(msg);
        });

        // Scroll to bottom after loading history
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    } catch (err) {
        console.error('Error fetching messages:', err);
    }
}
