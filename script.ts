// Initialize Web MIDI API
const pianoKeys: NodeListOf<HTMLElement> = document.querySelectorAll('.piano-key');

// Define a type for MIDI message data
type MIDIMessageData = [number, number, number];

// Initialize Web MIDI API
if (navigator.requestMIDIAccess) {
  console.log('This browser supports WebMIDI!');
  navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
} else {
  console.log('WebMIDI is not supported in this browser.');
}

function onMIDISuccess(midiAccess: WebMidi.MIDIAccess): void {
  console.log('MIDI Access ready!');

  const inputs: IterableIterator<WebMidi.MIDIInput> = midiAccess.inputs.values();
  for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
    input.value.onmidimessage = onMIDIMessage;
  }
}

function onMIDIFailure(): void {
  console.log('Could not access your MIDI devices.');
}

function onMIDIMessage(event: WebMidi.MIDIMessageEvent): void {
  const data: MIDIMessageData = event.data as MIDIMessageData;
  const midiCommand: number = data[0];
  const note: number = data[1];
  const velocity: number = data[2];

  if (midiCommand === 144) { // Note On
    playNote(note, velocity);
  } else if (midiCommand === 128) { // Note Off
    stopNote(note);
  }
}

function playNote(note: number, velocity: number): void {
  console.log('Playing note:', note, 'with velocity:', velocity);
  const keyElement: HTMLElement | null = document.querySelector(`.piano-key[data-note="${note}"]`);
  if (keyElement) {
    keyElement.classList.add('pressed');
    // Example: You can play sound here using AudioContext and MIDI notes
  }
}

function stopNote(note: number): void {
  console.log('Stopping note:', note);
  const keyElement: HTMLElement | null = document.querySelector(`.piano-key[data-note="${note}"]`);
  if (keyElement) {
    keyElement.classList.remove('pressed');
    // Example: You can stop sound here
  }
}

// Handle mouse click events on the keys
pianoKeys.forEach((key: HTMLElement) => {
  key.addEventListener('mousedown', (event: MouseEvent) => {
    const note: number = parseInt(key.dataset.note || '0');
    playNote(note, 100); // Assuming a velocity of 100
  });
  key.addEventListener('mouseup', (event: MouseEvent) => {
    const note: number = parseInt(key.dataset.note || '0');
    stopNote(note);
  });
  key.addEventListener('mouseout', (event: MouseEvent) => {
    const note: number = parseInt(key.dataset.note || '0');
    stopNote(note);
  });
});