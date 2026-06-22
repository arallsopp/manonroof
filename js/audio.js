/**
 * AudioService — singleton
 *
 * Web Speech API for exercise name announcement.
 * AudioContext beep as a fallback / rep feedback tone.
 * Both require a prior user gesture on iOS — call unlock() on first tap.
 */

const AudioService = (() => {
    let _audioCtx = null;
    let _unlocked = false;

    function _ctx() {
        if (!_audioCtx) {
            _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (_audioCtx.state === 'suspended') {
            _audioCtx.resume();
        }
        return _audioCtx;
    }

    // Call on the first deliberate user tap to satisfy iOS audio policy.
    function unlock() {
        if (_unlocked) return;
        _unlocked = true;

        // Unlock AudioContext with a silent buffer
        try {
            const ctx = _ctx();
            const buf = ctx.createBuffer(1, 1, 22050);
            const src = ctx.createBufferSource();
            src.buffer = buf;
            src.connect(ctx.destination);
            src.start(0);
        } catch (_) {}

        // Prime SpeechSynthesis — iOS needs a gesture-originated speak() call
        // before it will work autonomously. Use a zero-volume utterance.
        try {
            const u = new SpeechSynthesisUtterance('​');
            u.volume = 0;
            speechSynthesis.speak(u);
        } catch (_) {}
    }

    function speak(text) {
        try {
            speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text);
            u.lang = 'en-GB';
            u.rate = 0.95;
            u.pitch = 1;
            speechSynthesis.speak(u);
        } catch (_) {}
    }

    function beep(freq = 880, duration = 0.08, volume = 0.25) {
        try {
            const ctx = _ctx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(volume, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + duration);
        } catch (_) {}
    }

    // Higher-pitched "done" tone when finishing an exercise
    function chime() {
        beep(1047, 0.15, 0.3);
        setTimeout(() => beep(1319, 0.2, 0.25), 120);
    }

    return { unlock, speak, beep, chime };
})();
