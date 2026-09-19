/**
 * Noor Chat Web Audio API Sound Synthesizer
 * Provides pure synthesizer sounds for Android notifications, ringtones, and mic analysis.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play an Android notification chime (Noor radiant bell)
 */
export function playNotificationSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    // Pleasant high melodic chime: E6 -> G#6 -> B6
    osc1.frequency.setValueAtTime(1318.5, now);
    osc1.frequency.exponentialRampToValueAtTime(1661.2, now + 0.08);
    osc1.frequency.exponentialRampToValueAtTime(1975.5, now + 0.16);

    osc2.frequency.setValueAtTime(659.25, now);
    osc2.frequency.exponentialRampToValueAtTime(987.77, now + 0.16);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.46);
    osc2.stop(now + 0.46);
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
}

/**
 * Play subtle message sent pop
 */
export function playSentSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

/**
 * Ringtone player for incoming / outgoing calls
 */
let ringtoneInterval: number | null = null;

export function startRingtone(type: 'incoming' | 'outgoing') {
  stopRingtone();
  
  const playPulse = () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const gain = ctx.createGain();

      if (type === 'incoming') {
        // Android Marimba / Ripple style dual tone
        const freqs = [587.33, 739.99, 880, 1174.66]; // D5, F#5, A5, D6
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.12);
          const toneGain = ctx.createGain();
          toneGain.gain.setValueAtTime(0.15, now + idx * 0.12);
          toneGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);
          osc.connect(toneGain);
          toneGain.connect(ctx.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.38);
        });
      } else {
        // Standard outgoing phone ringback (440Hz + 480Hz)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.frequency.setValueAtTime(440, now);
        osc2.frequency.setValueAtTime(480, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.setValueAtTime(0.08, now + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.3);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.35);
        osc2.stop(now + 1.35);
      }
    } catch (e) {
      console.warn('Ringtone error:', e);
    }
  };

  playPulse();
  ringtoneInterval = window.setInterval(playPulse, type === 'incoming' ? 2400 : 3500);
}

export function stopRingtone() {
  if (ringtoneInterval) {
    clearInterval(ringtoneInterval);
    ringtoneInterval = null;
  }
}
