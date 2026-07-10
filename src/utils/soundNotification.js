// ─── Notification sound ───────────────────────────────────────────────────────
// Generated with the Web Audio API instead of an .mp3 asset — this avoids a
// broken/missing file ever being the reason the sound "doesn't work", and
// needs no network request at all.
//
// IMPORTANT: browsers block audio playback until the user has interacted
// with the page at least once (click / keydown / tap). Call unlockAudio()
// from any early interaction handler (done once, globally, in
// MessagingContext) so playNotificationSound() is guaranteed to work by
// the time a real notification needs to fire.

let audioCtx = null;

function getContext() {
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    audioCtx = new AudioCtx();
  }
  return audioCtx;
}

let unlocked = false;

export function unlockAudio() {
  if (unlocked) return;
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  unlocked = true;
}

/** Plays a short two-tone "ding" — Discord-style notification chime. */
export function playNotificationSound() {
  try {
    const ctx = getContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      // Will only actually resume if unlockAudio() already ran once from a
      // real user gesture — otherwise this silently no-ops, which is the
      // correct behavior (browsers require that gesture regardless).
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const tones = [784, 1046.5]; // G5 -> C6, pleasant short chime

    tones.forEach((freq, i) => {
      const start = now + i * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.2, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.24);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.26);
    });
  } catch (err) {
    // Never let a notification sound crash the app
    console.warn("Notification sound failed to play:", err);
  }
}