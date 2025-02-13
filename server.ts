import { WebSocketServer, WebSocket } from "ws";

const PORT = 8080;

const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws: WebSocket) => {
	console.log("Client connected");

	ws.on("message", (message: string) => {
		console.log(`Received: ${message}`);
		wss.clients.forEach((client) => {
			if (client !== ws && client.readyState === WebSocket.OPEN) {
				client.send(message);
			}
		});
	});

	ws.on("close", () => {
		console.log("Client disconnected");
	});

	ws.on("error", (error) => {
		console.error("Client error:", error);
	});
});

wss.on("error", (error) => {
	console.error("Server error:", error);
});

console.log(`WebSocket server started on port ${PORT}`);
