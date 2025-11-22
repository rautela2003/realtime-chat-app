# Real-Time Chat Application

A real-time chat application built with Node.js, Express, Socket.io, and MongoDB.

## Features

- **Real-time Messaging**: Send and receive messages instantly using Socket.io.
- **User Management**: Join with a username, see online users, and get notified when users join/leave.
- **Typing Indicators**: See when other users are typing.
- **Message History**: Loads the last 50 messages from MongoDB upon joining.
- **Responsive UI**: Clean, WhatsApp-inspired interface.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Real-time Engine**: Socket.io
- **Database**: MongoDB (Mongoose)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript

## Prerequisites

- Node.js installed
- MongoDB installed and running (default: `mongodb://localhost:27017/chat-app`)

## Installation

1.  Clone the repository (or download the source).
2.  Navigate to the project directory:
    ```bash
    cd realtime-chat-app
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Create a `.env` file (optional, defaults provided in code):
    ```
    PORT=3000
    MONGO_URI=mongodb://localhost:27017/chat-app
    ```

## Running the Application

1.  Start the server:
    ```bash
    npm start
    ```
    Or for development with auto-restart:
    ```bash
    npm run dev
    ```

2.  Open your browser and visit: `http://localhost:3000`

3.  Open multiple tabs to simulate different users.

## API Endpoints

- `GET /messages/latest`: Returns the last 50 messages.
- `POST /messages`: Save a new message (JSON body: `{ "username": "...", "text": "...", "room": "..." }`).

## Project Structure

- `server.js`: Main server file (Express + Socket.io setup).
- `models/`: MongoDB schemas (User, Message).
- `public/`: Frontend assets (HTML, CSS, JS).
