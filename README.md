# Real-Time Chat Application

A premium real-time chat application built with **React (Vite)**, **Node.js**, **Socket.io**, and **MongoDB**.

## Features

- **Real-time Messaging**: Instant communication powered by Socket.io.
- **Premium UI**: Modern dark mode design with glassmorphism and smooth animations.
- **React Frontend**: Built with Vite for fast performance and component-based architecture.
- **User Management**: Join with a username and room.
- **Typing Indicators**: See when others are typing.
- **Message History**: Loads recent messages from MongoDB (with in-memory fallback).

## Tech Stack

- **Frontend**: React, Vite, CSS3 (Glassmorphism)
- **Backend**: Node.js, Express.js
- **Real-time**: Socket.io
- **Database**: MongoDB (Mongoose)

## Prerequisites

- Node.js installed
- MongoDB installed (optional - app falls back to in-memory storage if DB is missing)

## Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/YOUR_USERNAME/realtime-chat-app.git
    cd realtime-chat-app
    ```

2.  **Install Backend Dependencies**:
    ```bash
    npm install
    ```

3.  **Install Frontend Dependencies**:
    ```bash
    cd client
    npm install
    ```

## Running the Application

You need to run both the backend (server) and frontend (client).

### 1. Start the Backend
From the root directory:
```bash
npm start
```
*Server runs on port 3000.*

### 2. Start the Frontend
Open a new terminal, navigate to `client`, and run:
```bash
cd client
npm run dev
```
*Client runs on http://localhost:5173.*

## Usage

1.  Open `http://localhost:5173` in your browser.
2.  Enter a username and room name (e.g., "General").
3.  Click **Join Room**.
4.  Start chatting! Open multiple tabs to simulate different users.

## Project Structure

- `server.js`: Backend server (Express + Socket.io).
- `client/`: React frontend application.
  - `src/components/`: React components (ChatRoom, JoinScreen).
  - `src/index.css`: Global styles and themes.
- `models/`: MongoDB schemas.
