import { defineStore } from 'pinia';
import { WebMidi } from 'webmidi';
import { io, Socket } from 'socket.io-client';

interface MidiState {
	isConnected: boolean;
	username: string;
	connectedUsers: Array<{ username: string; lastActive: number }>;
	selectedInput: string | null;
	selectedOutput: string | null;
	availableInputs: Array<{ id: string; name: string }>;
	availableOutputs: Array<{ id: string; name: string }>;
	socket: Socket | null;
}

export const useMidiStore = defineStore('midi', {
	state: (): MidiState => ({
		isConnected: false,
		username: '',
		connectedUsers: [],
		selectedInput: null,
		selectedOutput: null,
		availableInputs: [],
		availableOutputs: [],
		socket: null
	}),

	actions: {
		async initialize() {
			try {
				await WebMidi.enable();
				this.isConnected = true;
				this.updateDeviceLists();
				
				// Setup WebSocket connection
				this.socket = io('http://localhost:3000');
				this.setupSocketListeners();
				
				// Listen for device changes
				WebMidi.addListener("connected", () => this.updateDeviceLists());
				WebMidi.addListener("disconnected", () => this.updateDeviceLists());
			} catch (err) {
				console.error('Failed to initialize WebMidi:', err);
			}
		},

		updateDeviceLists() {
			this.availableInputs = WebMidi.inputs.map(input => ({
				id: input.id,
				name: input.name
			}));
			this.availableOutputs = WebMidi.outputs.map(output => ({
				id: output.id,
				name: output.name
			}));
		},

		setupSocketListeners() {
			if (!this.socket) return;

			this.socket.on('users:update', (users) => {
				this.connectedUsers = users;
			});

			this.socket.on('midi:message', (data) => {
				if (this.selectedOutput && WebMidi.isEnabled) {
					const output = WebMidi.getOutputById(this.selectedOutput);
					if (output) {
						output.sendMessage(data.message);
					}
				}
			});
		},

		setUsername(username: string) {
			this.username = username;
			this.socket?.emit('user:join', username);
		},

		selectInput(inputId: string) {
			if (this.selectedInput) {
				const oldInput = WebMidi.getInputById(this.selectedInput);
				oldInput?.removeListener();
			}

			this.selectedInput = inputId;
			const input = WebMidi.getInputById(inputId);
			
			if (input && this.socket) {
				input.addListener('midimessage', (e) => {
					this.socket?.emit('midi:message', {
						message: e.message,
						timestamp: e.timestamp
					});
				});
			}
		},

		selectOutput(outputId: string) {
			this.selectedOutput = outputId;
		}
	}
});
