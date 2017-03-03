"use strict";

let audioCtx;
try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
} catch(e) {
    console.error("Web Audio API is not supported.");
}

function beep(frequency = 440, duration = 500) {
    let oscillator = audioCtx.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    oscillator.connect(audioCtx.destination);
    oscillator.start(0);
    setTimeout(() => oscillator.stop(0), duration);
}