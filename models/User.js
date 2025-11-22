const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    socketId: {
        type: String,
        required: true
    },
    online: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('User', UserSchema);
