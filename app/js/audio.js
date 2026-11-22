"use strict";

let audioCtx;

async function beep(frequency = 440, duration = 500) {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if(!AudioContext || !Number.isFinite(frequency) || frequency <= 0 ||
           !Number.isFinite(duration) || duration <= 0) return false;
        audioCtx ||= new AudioContext();
        if(audioCtx.state === "suspended") await audioCtx.resume();
        if(audioCtx.state === "closed") return false;
        const oscillator = audioCtx.createOscillator();
        oscillator.type = "sine";
        oscillator.frequency.value = Math.min(frequency, audioCtx.sampleRate / 2);
        oscillator.connect(audioCtx.destination);
        oscillator.onended = () => oscillator.disconnect();
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + Math.min(duration, 60000) / 1000);
        return true;
    } catch(e) {
        // Audio may be denied or unavailable; simulation must continue silently.
        return false;
    }
}
