import type { DirectionId, SoundCueId } from "./catalogue";

/**
 * Boceto sonoro de M5.
 *
 * Sintetiza las señales de cada dirección en el navegador para poder compararlas sobre el
 * corte funcional. No es producción de audio: no hay archivos, licencias ni recursos
 * definitivos, y todo el módulo se descarta cuando M8 produzca el lenguaje sonoro real.
 *
 * Toda señal emitida aquí tiene un equivalente textual obligatorio en `catalogue.ts`, que la
 * interfaz muestra siempre, incluso con el sonido silenciado.
 */

type Step =
  | { readonly kind: "tone"; readonly delayMs: number; readonly freq: number; readonly wave: OscillatorType; readonly durationMs: number; readonly level: number }
  | { readonly kind: "noise"; readonly delayMs: number; readonly freq: number; readonly durationMs: number; readonly level: number };

type SoundableDirectionId = Exclude<DirectionId, "gris">;

function tone(delayMs: number, freq: number, wave: OscillatorType, durationMs: number, level: number): Step {
  return { kind: "tone", delayMs, freq, wave, durationMs, level };
}

function noise(delayMs: number, freq: number, durationMs: number, level: number): Step {
  return { kind: "noise", delayMs, freq, durationMs, level };
}

const RECIPES: Record<SoundableDirectionId, Record<SoundCueId, readonly Step[]>> = {
  // Acústico y escaso: lápiz, madera y un golpe de mesa.
  cuaderno: {
    decision: [noise(0, 2600, 45, 0.5)],
    "consequence-coherent-defensible": [
      tone(0, 587.33, "triangle", 170, 0.5),
      tone(120, 880, "triangle", 260, 0.45),
    ],
    "consequence-defensible-needs-revision": [
      tone(0, 587.33, "triangle", 170, 0.5),
      tone(120, 622.25, "triangle", 240, 0.45),
    ],
    "consequence-incoherent-with-brief": [tone(0, 261.63, "triangle", 220, 0.5)],
    incident: [tone(0, 110, "sine", 260, 0.6), noise(0, 400, 70, 0.25)],
    journal: [noise(0, 2600, 40, 0.4), noise(110, 2200, 40, 0.35)],
  },
  // Conjunto elemental: cuerpo, voz y láminas.
  laboratorio: {
    decision: [noise(0, 1800, 55, 0.4), tone(20, 1174.66, "triangle", 140, 0.3)],
    "consequence-coherent-defensible": [
      tone(0, 523.25, "triangle", 180, 0.45),
      tone(130, 659.25, "triangle", 180, 0.45),
      tone(260, 783.99, "triangle", 320, 0.42),
    ],
    "consequence-defensible-needs-revision": [
      tone(0, 523.25, "triangle", 180, 0.45),
      tone(130, 622.25, "triangle", 180, 0.45),
      tone(260, 783.99, "triangle", 320, 0.42),
    ],
    "consequence-incoherent-with-brief": [
      tone(0, 523.25, "triangle", 200, 0.42),
      tone(90, 554.37, "triangle", 260, 0.42),
    ],
    incident: [tone(0, 82.41, "sine", 420, 0.7), tone(60, 164.81, "sine", 300, 0.3)],
    journal: [tone(0, 1046.5, "sine", 200, 0.35), tone(140, 1567.98, "sine", 340, 0.3)],
  },
  // Sonificación de interfaz: intervalos como estado, sin intención musical.
  consola: {
    decision: [tone(0, 880, "square", 35, 0.28)],
    "consequence-coherent-defensible": [
      tone(0, 440, "square", 190, 0.25),
      tone(0, 660, "square", 190, 0.25),
    ],
    "consequence-defensible-needs-revision": [
      tone(0, 440, "square", 190, 0.25),
      tone(0, 587.33, "square", 190, 0.25),
    ],
    "consequence-incoherent-with-brief": [
      tone(0, 440, "square", 240, 0.25),
      tone(0, 466.16, "square", 240, 0.25),
    ],
    incident: [tone(0, 174.61, "square", 110, 0.35), tone(180, 174.61, "square", 110, 0.35)],
    journal: [tone(0, 1318.51, "square", 45, 0.22), tone(80, 987.77, "square", 70, 0.22)],
  },
};

export interface SoundSketch {
  play(direction: DirectionId, cue: SoundCueId, options: { muted: boolean; volume: number }): void;
}

function isSoundable(direction: DirectionId): direction is SoundableDirectionId {
  return direction !== "gris";
}

export function createSoundSketch(): SoundSketch {
  let context: AudioContext | undefined;
  let noiseBuffer: AudioBuffer | undefined;

  const ensureContext = (): AudioContext | undefined => {
    if (context) return context;
    const Ctor = typeof window === "undefined" ? undefined : window.AudioContext;
    if (!Ctor) return undefined;
    try {
      context = new Ctor();
      return context;
    } catch {
      return undefined;
    }
  };

  const ensureNoise = (ctx: AudioContext): AudioBuffer => {
    if (noiseBuffer) return noiseBuffer;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.5), ctx.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let index = 0; index < channel.length; index += 1) {
      channel[index] = Math.random() * 2 - 1;
    }
    noiseBuffer = buffer;
    return buffer;
  };

  return {
    play(direction, cue, options) {
      if (options.muted || options.volume <= 0 || !isSoundable(direction)) return;
      const ctx = ensureContext();
      if (!ctx) return;
      try {
        if (ctx.state === "suspended") void ctx.resume();
        const volume = Math.min(1, Math.max(0, options.volume));
        const start = ctx.currentTime + 0.01;

        for (const step of RECIPES[direction][cue]) {
          const at = start + step.delayMs / 1000;
          const seconds = step.durationMs / 1000;
          const peak = step.level * volume * 0.32;
          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.0001, at);
          gain.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), at + 0.008);
          gain.gain.exponentialRampToValueAtTime(0.0001, at + seconds);
          gain.connect(ctx.destination);

          if (step.kind === "tone") {
            const oscillator = ctx.createOscillator();
            oscillator.type = step.wave;
            oscillator.frequency.setValueAtTime(step.freq, at);
            oscillator.connect(gain);
            oscillator.start(at);
            oscillator.stop(at + seconds + 0.02);
          } else {
            const source = ctx.createBufferSource();
            source.buffer = ensureNoise(ctx);
            const filter = ctx.createBiquadFilter();
            filter.type = "bandpass";
            filter.frequency.setValueAtTime(step.freq, at);
            filter.Q.setValueAtTime(1.2, at);
            source.connect(filter);
            filter.connect(gain);
            source.start(at);
            source.stop(at + seconds + 0.02);
          }
        }
      } catch {
        // El boceto sonoro nunca debe impedir jugar: si el audio falla, el texto sigue estando.
      }
    },
  };
}
