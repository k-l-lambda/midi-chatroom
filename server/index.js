import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: "http://localhost:5173",
		methods: ["GET", "POST"]
	}
});

// Store connected users
const connectedUsers = new Map();

io.on('connection', (socket) => {
	console.log('User connected:', socket.id);

	socket.on('user:join', (username) => {
		connectedUsers.set(socket.id, { username, lastActive: Date.now() });
		io.emit('users:update', Array.from(connectedUsers.values()));
	});

	socket.on('midi:message', (midiData) => {
		const user = connectedUsers.get(socket.id);
		if (user) {
			socket.broadcast.emit('midi:message', {
				...midiData,
				username: user.username
			});
		}
	});

	socket.on('disconnect', () => {
		connectedUsers.delete(socket.id);
		io.emit('users:update', Array.from(connectedUsers.values()));
		console.log('User disconnected:', socket.id);
	});
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
