<template>
  <div class="piano-container">
    <div class="piano">
      <div 
        v-for="note in notes" 
        :key="note.midiNote"
        :class="['key', note.type, { active: activeNotes.includes(note.midiNote) }]"
        @mousedown="playNote(note.midiNote)"
        @mouseup="stopNote(note.midiNote)"
        @mouseleave="handleMouseLeave(note.midiNote)"
        @mouseenter="handleMouseEnter(note.midiNote)"
        @mousemove="handleMouseMove(note.midiNote)"
      >
        <span class="note-label">{{ note.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { MidiAudio } from '@k-l-lambda/music-widgets';

const activeNotes = ref<number[]>([]);
const mouseIsDown = ref(false);

// Define piano notes (2 octaves from C4 to B5)
const notes = [
  { midiNote: 60, label: 'C4', type: 'white' },
  { midiNote: 61, label: 'C#4', type: 'black' },
  { midiNote: 62, label: 'D4', type: 'white' },
  { midiNote: 63, label: 'D#4', type: 'black' },
  { midiNote: 64, label: 'E4', type: 'white' },
  { midiNote: 65, label: 'F4', type: 'white' },
  { midiNote: 66, label: 'F#4', type: 'black' },
  { midiNote: 67, label: 'G4', type: 'white' },
  { midiNote: 68, label: 'G#4', type: 'black' },
  { midiNote: 69, label: 'A4', type: 'white' },
  { midiNote: 70, label: 'A#4', type: 'black' },
  { midiNote: 71, label: 'B4', type: 'white' },
  { midiNote: 72, label: 'C5', type: 'white' },
  { midiNote: 73, label: 'C#5', type: 'black' },
  { midiNote: 74, label: 'D5', type: 'white' },
  { midiNote: 75, label: 'D#5', type: 'black' },
  { midiNote: 76, label: 'E5', type: 'white' },
  { midiNote: 77, label: 'F5', type: 'white' },
  { midiNote: 78, label: 'F#5', type: 'black' },
  { midiNote: 79, label: 'G5', type: 'white' },
  { midiNote: 80, label: 'G#5', type: 'black' },
  { midiNote: 81, label: 'A5', type: 'white' },
  { midiNote: 82, label: 'A#5', type: 'black' },
  { midiNote: 83, label: 'B5', type: 'white' },
];

const emit = defineEmits<{
  (e: 'midi-message', message: { data: number[], timestamp: number }): void
}>();

const playNote = (midiNote: number) => {
  if (!activeNotes.value.includes(midiNote)) {
    activeNotes.value.push(midiNote);
    
    // Play note using MidiAudio
    MidiAudio.noteOn(0, midiNote, 100);
    
    // Emit MIDI message
    emit('midi-message', {
      data: [0x90, midiNote, 100], // Note On, note number, velocity
      timestamp: performance.now()
    });
  }
};

const stopNote = (midiNote: number) => {
  activeNotes.value = activeNotes.value.filter(note => note !== midiNote);
  
  // Stop note using MidiAudio
  MidiAudio.noteOff(0, midiNote);
  
  // Emit MIDI message
  emit('midi-message', {
    data: [0x80, midiNote, 0], // Note Off, note number, velocity
    timestamp: performance.now()
  });
};

const handleMouseEnter = (midiNote: number) => {
  // Check if the left mouse button (button 0) is pressed
  if (mouseIsDown.value) {
    playNote(midiNote);
  }
};

const handleMouseLeave = (midiNote: number) => {
  stopNote(midiNote);
};

const handleMouseMove = (midiNote: number) => {
  //if (activeNotes.value.includes(midiNote)) return;
  //playNote(midiNote);
};

window.addEventListener('mousedown', () => {
  mouseIsDown.value = true;
});

window.addEventListener('mouseup', () => {
  mouseIsDown.value = false;
});
</script>

<style scoped>
.piano-container {
  width: 100%;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  box-sizing: border-box; /* Ensures padding is included in the total size */
}

.piano {
  position: relative;
  height: 200px;
  display: flex;
  justify-content: center;
}

.key {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 10px;
  border: 1px solid #ccc;
  cursor: pointer;
  user-select: none;
  box-sizing: border-box;
}

.white {
  background: white;
  width: calc(100% / 14); /* 14 white keys */
  height: 100%;
  z-index: 1;
}

.black {
  background: #333;
  width: calc(100% / 24); /* Thinner than white keys */
  height: 60%;
  margin-left: calc(-100% / 48);
  margin-right: calc(-100% / 48);
  z-index: 2;
}

.key.active {
  background: #42b883;
}

.black.active {
  background: #557596;
}

.note-label {
  font-size: 12px;
  color: #666;
}

.black .note-label {
  color: white;
}
</style>
