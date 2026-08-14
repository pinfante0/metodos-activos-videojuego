import type { SoundCueId } from "./identity";

/**
 * Boceto sonoro de la identidad fijada en M5.
 *
 * Sintetiza las seis señales en el navegador. **No es producción de audio**: M8 sustituirá estas
 * recetas por recursos grabados con procedencia y licencia registradas, y este módulo desaparece
 * entonces. El inventario de `src/content/identity/resources.json` ya declara esas seis señales
 * como prototipos con su equivalente textual.
 *
 * Lógica de estados heredada de la Consola: quinta justa para lo coherente, cuarta para lo
 * defendible con revisión y segunda menor con batido para lo incoherente. Timbre heredado del
 * Aula-laboratorio: cuerpo, madera y láminas. Ninguna señal llega a medio segundo y no existe
 * ningún sonido continuo: la fatiga sonora es un riesgo declarado de esta identidad.
 *
 * Toda señal tiene equivalente textual obligatorio en `identity.ts`, que la interfaz muestra
 * siempre, incluso con el sonido silenciado.
 */

type Step =
  | { readonly kind: "tone"; readonly delayMs: number; readonly freq: number; readonly wave: OscillatorType; readonly durationMs: number; readonly level: number }
  | { readonly kind: "noise"; readonly delayMs: number; readonly freq: number; readonly durationMs: number; readonly level: number };

function tone(delayMs: number, freq: number, wave: OscillatorType, durationMs: number, level: number): Step {
  return { kind: "tone", delayMs, freq, wave, durationMs, level };
}

function noise(delayMs: number, freq: number, durationMs: number, level: number): Step {
  return { kind: "noise", delayMs, freq, durationMs, level };
}

/** Do5 como lámina de referencia: el intervalo, no la altura, es lo que cifra el estado. */
const LAMINA = 523.25;

const RECIPES: Record<SoundCueId, readonly Step[]> = {
  // Palmada corporal: ruido filtrado y corto, sin altura definida.
  decision: [noise(0, 1700, 50, 0.42)],
  // Quinta justa ascendente: cerrada, estable.
  "consequence-coherent-defensible": [
    tone(0, LAMINA, "triangle", 180, 0.45),
    tone(120, LAMINA * 1.5, "triangle", 300, 0.42),
  ],
  // Cuarta: suena a apertura sin resolver.
  "consequence-defensible-needs-revision": [
    tone(0, LAMINA, "triangle", 180, 0.45),
    tone(120, LAMINA * (4 / 3), "triangle", 300, 0.42),
  ],
  // Segunda menor simultánea: el batido es la señal.
  "consequence-incoherent-with-brief": [
    tone(0, LAMINA, "triangle", 300, 0.38),
    tone(0, LAMINA * 1.059463, "triangle", 300, 0.38),
  ],
  // Parche grave con un punto de cuerpo, un solo golpe.
  incident: [tone(0, 82.41, "sine", 400, 0.7), noise(0, 320, 90, 0.28)],
  // Dos láminas suaves descendentes: cierra sin premiar.
  journal: [tone(0, LAMINA * 1.5, "sine", 190, 0.32), tone(130, LAMINA, "sine", 320, 0.3)],
};

export interface SoundSketch {
  play(cue: SoundCueId, options: { muted: boolean; volume: number }): void;
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
    play(cue, options) {
      if (options.muted || options.volume <= 0) return;
      const ctx = ensureContext();
      if (!ctx) return;
      try {
        if (ctx.state === "suspended") void ctx.resume();
        const volume = Math.min(1, Math.max(0, options.volume));
        const start = ctx.currentTime + 0.01;

        for (const step of RECIPES[cue]) {
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
        // El sonido nunca debe impedir jugar: si el audio falla, el texto sigue estando.
      }
    },
  };
}
