https://brotochola.github.io/auto-lipsync-speech-synth

# Auto Lipsync Speech Synthesis

## How It Works

This project implements an automatic lip-sync system that converts text to synchronized mouth movements through the following process:

### Text → Phonemes → Visemes

1. **Text Input**: The system starts with written text that needs to be spoken
2. **Phonemes**: The text is converted into phonemes (the basic units of sound in speech)
3. **Visemes**: Phonemes are then mapped to visemes (visual mouth shapes that correspond to specific sounds)

### Synchronization with Web Speech API

We utilize the **Web Speech Synthesis API** to achieve precise timing synchronization:

- The `SpeechSynthesisUtterance` object provides an `onBoundary` event
- This event fires at word and sentence boundaries during speech playback
- By listening to these boundary events, we can synchronize the visual mouth movements (visemes) with the actual audio output
- This ensures that the lip movements match perfectly with the spoken words in real-time

### Key Features

- Real-time lip-sync generation
- Automatic phoneme-to-viseme mapping
- Precise timing synchronization using speech boundary events
- Web-based implementation using standard browser APIs
