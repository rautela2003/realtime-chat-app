const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const Message = require('./models/Message');
const User = require('./models/User');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/chat-app';
let isMongoConnected = false;
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('MongoDB Connected');
        isMongoConnected = true;
    })
    .catch(err => console.error('MongoDB connection error:', err));

// In-memory user store for active sockets (faster than DB for just online list)
// But we will also try to sync with DB if needed. For this starter, we'll use an object for quick lookups.
const users = {};
const localMessages = [];

// Routes
app.get('/messages/latest', async (req, res) => {
    try {
        if (!isMongoConnected) {
            return res.json(localMessages.slice().reverse());
        }
        const messages = await Message.find().sort({ createdAt: -1 }).limit(50);
        res.json(messages.reverse()); // Return oldest first for chat history
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

app.post('/messages', async (req, res) => {
    try {
        const { username, text, room } = req.body;

        if (!isMongoConnected) {
            const newMessage = { username, text, room, createdAt: new Date() };
            localMessages.push(newMessage);
            if (localMessages.length > 50) localMessages.shift(); // Keep only last 50

            io.emit('message', newMessage);
            return res.status(201).json(newMessage);
        }

        const newMessage = new Message({ username, text, room });
        await newMessage.save();

        // Also emit via socket if using REST API to post (optional hybrid approach)
        io.emit('message', {
            username,
            text,
            createdAt: newMessage.createdAt
        });

        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save message' });
    }
});

// Socket.io Events
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join Room / User Login
    socket.on('joinRoom', async ({ username }) => {
        users[socket.id] = username;

        // Optional: Save/Update user in DB
        if (isMongoConnected) {
            try {
                await User.findOneAndUpdate(
                    { username },
                    { socketId: socket.id, online: true },
                    { upsert: true, new: true }
                );
            } catch (err) {
                console.error("Error saving user:", err);
            }
        }

        // Broadcast to others
        socket.broadcast.emit('message', {
            username: 'System',
            text: `${username} has joined the chat`,
            createdAt: new Date()
        });

        // Send welcome message to user
        socket.emit('message', {
            username: 'System',
            text: `Welcome to the chat, ${username}!`,
            createdAt: new Date()
        });

        // Update user list
        io.emit('online-users', Object.values(users));
    });

    // Chat Message
    socket.on('chatMessage', async (msgData) => {
        const { username, text } = msgData;

        // Save to DB
        if (isMongoConnected) {
            try {
                const newMessage = new Message({ username, text });
                await newMessage.save();

                // Broadcast to all
                io.emit('message', {
                    username,
                    text,
                    createdAt: newMessage.createdAt
                });
            } catch (err) {
                console.error("Error saving message:", err);
            }
        } else {
            // Fallback
            const newMessage = { username, text, createdAt: new Date() };
            localMessages.push(newMessage);
            if (localMessages.length > 50) localMessages.shift();
            io.emit('message', newMessage);
        }
    });

    // Typing Indicator
    socket.on('typing', (username) => {
        socket.broadcast.emit('typing', username);
    });

    // Disconnect
    socket.on('disconnect', async () => {
        const username = users[socket.id];
        if (username) {
            // Broadcast leave
            io.emit('message', {
                username: 'System',
                text: `${username} has left the chat`,
                createdAt: new Date()
            });

            // Remove from memory
            delete users[socket.id];

            // Update DB
            if (isMongoConnected) {
                try {
                    await User.findOneAndUpdate({ username }, { online: false });
                } catch (err) {
                    console.error("Error updating user offline:", err);
                }
            }

            // Update user list
            io.emit('online-users', Object.values(users));
        }
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
