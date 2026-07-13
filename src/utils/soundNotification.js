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

/**
 * Attempts to unlock the AudioContext. Returns a Promise<boolean> so the
 * caller can tell whether it actually worked — unlike before, this does
 * NOT mark itself "unlocked" just because resume() was called; it waits
 * for confirmation the context is really running. That matters because a
 * single failed/late resume() used to permanently disable sound for the
 * rest of the tab's life (the click/keydown listener that calls this only
 * fires once). Now, if it fails, the caller can leave the listener in
 * place and simply try again on the next interaction.
 */
export function unlockAudio() {
  if (unlocked) return Promise.resolve(true);
  const ctx = getContext();
  if (!ctx) return Promise.resolve(false);

  if (ctx.state === "running") {
    unlocked = true;
    return Promise.resolve(true);
  }

  return ctx
    .resume()
    .then(() => {
      if (ctx.state === "running") {
        unlocked = true;
        return true;
      }
      return false;
    })
    .catch(() => false);
}

/** Plays a longer four-note ascending melody — C6, E6, G6, C7. */
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
    const tones = [1046.5, 1318.5, 1568, 2093]; // C6 -> E6 -> G6 -> C7

    tones.forEach((freq, i) => {
      const start = now + i * 0.1;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.35, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.37);
    });
  } catch (err) {
    // Never let a notification sound crash the app
    console.warn("Notification sound failed to play:", err);
  }
}