// @ts-ignore
class VADProcessor extends AudioWorkletProcessor {
  private silenceCount: number;
  private speechCount: number;
  private readonly ENERGY_THRESHOLD: number;
  private readonly SILENCE_THRESHOLD: number;
  private readonly MIN_SPEECH_FRAMES: number;

  constructor() {
    super();
    this.silenceCount = 0;
    this.speechCount = 0;
    this.ENERGY_THRESHOLD = 0.01;
    this.SILENCE_THRESHOLD = 20;
    this.MIN_SPEECH_FRAMES = 6; // Avoid false starts
  }

  private calculateEnergy(buffer: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    return Math.sqrt(sum / buffer.length);
  }

  process(inputs: Float32Array[][]): boolean {
    const input = inputs[0]?.[0];

    if (!input) return true;

    const energy = this.calculateEnergy(input);

    if (energy > this.ENERGY_THRESHOLD) {
      this.silenceCount = 0;
      this.speechCount++;
    } else {
      this.silenceCount++;
    }

    // Ensure enough speech before stopping
    if (
      this.silenceCount > this.SILENCE_THRESHOLD &&
      this.speechCount > this.MIN_SPEECH_FRAMES
    ) {
      this.port.postMessage({ type: 'silence-detected' });
      this.speechCount = 0;
      this.silenceCount = 0;
    }

    return true;
  }
}

// @ts-ignore
registerProcessor('vad-processor', VADProcessor);
