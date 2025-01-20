<template>
	<div class="app-container">
		<header>
			<h1>MIDI Chat Room</h1>
		</header>

		<main>
			<div v-if="!midiStore.username" class="login-container">
				<h2>Enter Your Name</h2>
				<div class="input-group">
					<input 
						v-model="tempUsername" 
						@keyup.enter="joinRoom"
						placeholder="Your name..."
					>
					<button @click="joinRoom">Join</button>
				</div>
			</div>

			<div v-else class="chat-container">
				<div class="piano-panel">
					<PianoKeyboard @midi-message="onMidiMessage" />
				</div>

				<div class="users-panel">
					<h3>Connected Users</h3>
					<ul class="users-list">
						<li 
							v-for="user in midiStore.connectedUsers" 
							:key="user.username"
							:class="{ active: isUserActive(user) }"
						>
							{{ user.username }}
						</li>
					</ul>
				</div>
			</div>
		</main>

		<footer>
			<p>Status: {{ midiStore.isConnected ? 'Connected' : 'Disconnected' }} | Audio: {{ midiAudioLoaded ? 'Ready' : 'Loading...' }}</p>
		</footer>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useMidiStore } from './stores/midi';
import { MidiAudio } from '@k-l-lambda/music-widgets';
import PianoKeyboard from './components/PianoKeyboard.vue';

const midiStore = useMidiStore();
const tempUsername = ref('');
const midiAudioLoaded = ref(false);

onMounted(async () => {
	await midiStore.initialize();
	
	// Initialize MidiAudio
	if (MidiAudio.WebAudio.empty()) {
		await MidiAudio.loadPlugin({
			soundfontUrl: '/soundfont/',
			api: 'webaudio'
		});
		midiAudioLoaded.value = true;
	} else {
		midiAudioLoaded.value = true;
	}
});

const onMidiMessage = (message: any) => {
	// Send to other users
	if (midiStore.socket) {
		midiStore.socket.emit('midi:message', {
			message: message.data,
			timestamp: message.timestamp
		});
	}
};

// Handle incoming MIDI messages from other users
watch(() => midiStore.socket, (socket) => {
	if (socket) {
		socket.on('midi:message', (data) => {
			if (midiAudioLoaded.value) {
				const [status, note, velocity] = data.message;
				const channel = status & 0xf;
				const type = status >> 4;
				
				if (type === 9 && velocity > 0) { // Note On
					MidiAudio.noteOn(channel, note, velocity);
				} else if (type === 8 || (type === 9 && velocity === 0)) { // Note Off
					MidiAudio.noteOff(channel, note);
				}
			}
		});
	}
}, { immediate: true });

const joinRoom = () => {
	if (tempUsername.value.trim()) {
		midiStore.setUsername(tempUsername.value.trim());
	}
};

const isUserActive = (user: { lastActive: number }) => {
	return Date.now() - user.lastActive < 5000;
};
</script>

<style scoped>
.app-container {
	max-width: 1200px;
	margin: 0 auto;
	padding: 2rem;
	min-height: 100vh;
	display: flex;
	flex-direction: column;
}

header {
	text-align: center;
	margin-bottom: 2rem;
}

h1 {
	color: #2c3e50;
	font-size: 2.5rem;
}

.login-container {
	max-width: 400px;
	margin: 0 auto;
	text-align: center;
}

.input-group {
	display: flex;
	gap: 1rem;
	margin-top: 1rem;
}

input {
	flex: 1;
	padding: 0.5rem;
	border: 1px solid #ddd;
	border-radius: 4px;
	font-size: 1rem;
}

button {
	padding: 0.5rem 1rem;
	background-color: #42b883;
	color: white;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	font-size: 1rem;
}

button:hover {
	background-color: #3aa876;
}

.chat-container {
	display: grid;
	grid-template-columns: 2fr 1fr;
	gap: 2rem;
	margin-top: 2rem;
}

.piano-panel {
	background-color: #f8f9fa;
	padding: 1.5rem;
	border-radius: 8px;
	box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.users-panel {
	background-color: #f8f9fa;
	padding: 1.5rem;
	border-radius: 8px;
	box-shadow: 0 2px 4px rgba(0,0,0,0.1);
	color: #333;
}

.users-list {
	list-style: none;
	padding: 0;
	margin: 0;
}

.users-list li {
	padding: 0.5rem;
	border-bottom: 1px solid #ddd;
	display: flex;
	justify-content: space-between;
	align-items: center;
	color: #333;
}

.users-list li:last-child {
	border-bottom: none;
}

.users-list li.active {
	background-color: #e8f5e9;
}

footer {
	margin-top: auto;
	text-align: center;
	padding: 1rem;
	color: #666;
}
</style>
