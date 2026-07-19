const tuningLibrary = [
  {
    id: "open-g",
    name: "Open G",
    notation: "gDGBD",
    description: "Standard bluegrass tuning. Open strings make a G-major chord and support familiar roll patterns.",
    strings: [
      { number: 5, note: "G4" },
      { number: 4, note: "D3" },
      { number: 3, note: "G3" },
      { number: 2, note: "B3" },
      { number: 1, note: "D4" },
    ],
  },
  {
    id: "double-c",
    name: "Double C",
    notation: "gCGCD",
    description: "A favorite old-time tuning with two C strings. Capo at fret 2 for double D: aDADE.",
    strings: [
      { number: 5, note: "G4" },
      { number: 4, note: "C3" },
      { number: 3, note: "G3" },
      { number: 2, note: "C4" },
      { number: 1, note: "D4" },
    ],
  },
  {
    id: "double-d",
    name: "Double D",
    notation: "aDADE",
    description: "Double C raised a whole step, commonly reached with a capo at fret 2 and the fifth string at A.",
    strings: [
      { number: 5, note: "A4" },
      { number: 4, note: "D3" },
      { number: 3, note: "A3" },
      { number: 2, note: "D4" },
      { number: 1, note: "E4" },
    ],
  },
  {
    id: "sawmill",
    name: "Sawmill / G modal",
    notation: "gDGCD",
    description: "Raises the second string from B to C for a suspended, modal sound used in many old-time tunes.",
    strings: [
      { number: 5, note: "G4" },
      { number: 4, note: "D3" },
      { number: 3, note: "G3" },
      { number: 2, note: "C4" },
      { number: 1, note: "D4" },
    ],
  },
  {
    id: "drop-c",
    name: "Drop C",
    notation: "gCGBD",
    description: "Open G with the fourth string lowered to C, adding a strong bass note for C-family repertoire.",
    strings: [
      { number: 5, note: "G4" },
      { number: 4, note: "C3" },
      { number: 3, note: "G3" },
      { number: 2, note: "B3" },
      { number: 1, note: "D4" },
    ],
  },
  {
    id: "open-c",
    name: "Open C",
    notation: "gCGCE",
    description: "A true C-major open chord, made from double C by raising the first string from D to E.",
    strings: [
      { number: 5, note: "G4" },
      { number: 4, note: "C3" },
      { number: 3, note: "G3" },
      { number: 2, note: "C4" },
      { number: 1, note: "E4" },
    ],
  },
  {
    id: "open-d",
    name: "Open D",
    notation: "f♯DF♯AD",
    description: "An open D-major tuning with the fifth string lowered to F-sharp. Raise it to A for a common variant.",
    strings: [
      { number: 5, note: "F#4" },
      { number: 4, note: "D3" },
      { number: 3, note: "F#3" },
      { number: 2, note: "A3" },
      { number: 1, note: "D4" },
    ],
  },
  {
    id: "open-d-a-drone",
    name: "Open D · A drone",
    notation: "aDF♯AD",
    description: "A bright open D variant that raises the short fifth string to A while the long strings form D major.",
    strings: [
      { number: 5, note: "A4" },
      { number: 4, note: "D3" },
      { number: 3, note: "F#3" },
      { number: 2, note: "A3" },
      { number: 1, note: "D4" },
    ],
  },
  {
    id: "d-minor",
    name: "Open D minor",
    notation: "aDFAD",
    description: "Lowers the third string of open D from F-sharp to F, producing a resonant D-minor chord.",
    strings: [
      { number: 5, note: "A4" },
      { number: 4, note: "D3" },
      { number: 3, note: "F3" },
      { number: 2, note: "A3" },
      { number: 1, note: "D4" },
    ],
  },
  {
    id: "g-minor",
    name: "G minor",
    notation: "gDGB♭D",
    description: "Open G with the second string lowered to B-flat, turning the open chord from G major to G minor.",
    strings: [
      { number: 5, note: "G4" },
      { number: 4, note: "D3" },
      { number: 3, note: "G3" },
      { number: 2, note: "Bb3" },
      { number: 1, note: "D4" },
    ],
  },
];

const tuningSelect = document.querySelector("#tuning-select");
const tuningName = document.querySelector("#tuning-name");
const tuningNotation = document.querySelector("#tuning-notation");
const tuningDescription = document.querySelector("#tuning-description");
const tuningStrings = document.querySelector("#tuning-strings");
const tunerToggle = document.querySelector("#tuner-toggle");
const tunerStatus = document.querySelector("#tuner-status");
const tunerError = document.querySelector("#tuner-error");
const detectedNote = document.querySelector("#detected-note");
const detectedFrequency = document.querySelector("#detected-frequency");
const closestString = document.querySelector("#closest-string");
const centMeter = document.querySelector("#cent-meter");
const centReading = document.querySelector("#cent-reading");
const gaugeNeedle = document.querySelector("#gauge-needle");
const concertPitchInput = document.querySelector("#concert-pitch");

const sharpNames = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
const noteSemitones = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };

let activeTuning = tuningLibrary[0];
let audioContext;
let microphoneStream;
let analyser;
let animationFrame;
let referenceContext;
let activeReferenceOscillator;

function getConcertPitch() {
  const value = Number.parseInt(concertPitchInput.value, 10);
  const pitch = Math.min(450, Math.max(430, Number.isFinite(value) ? value : 440));
  concertPitchInput.value = String(pitch);
  return pitch;
}

function noteToMidi(note) {
  const match = note.match(/^([A-G](?:#|b)?)(-?\d)$/);
  if (!match) return 69;
  return (Number(match[2]) + 1) * 12 + noteSemitones[match[1]];
}

function frequencyForNote(note) {
  return getConcertPitch() * 2 ** ((noteToMidi(note) - 69) / 12);
}

function displayNote(note) {
  return note.replace("#", "♯").replace("b", "♭");
}

function renderTuning() {
  tuningName.textContent = activeTuning.name;
  tuningNotation.textContent = activeTuning.notation;
  tuningDescription.textContent = activeTuning.description;
  tuningStrings.replaceChildren(
    ...activeTuning.strings.map((string) => {
      const item = document.createElement("li");
      const number = document.createElement("span");
      const pitch = document.createElement("span");
      const pitchName = document.createElement("strong");
      const frequency = document.createElement("span");
      const button = document.createElement("button");

      item.className = "tuning-string";
      number.className = "string-number";
      number.textContent = String(string.number);
      pitch.className = "string-pitch";
      pitchName.textContent = displayNote(string.note);
      frequency.textContent = `${frequencyForNote(string.note).toFixed(1)} Hz`;
      pitch.append(pitchName, frequency);
      button.className = "reference-tone";
      button.type = "button";
      button.textContent = "Play tone";
      button.setAttribute("aria-label", `Play reference tone for string ${string.number}, ${displayNote(string.note)}`);
      button.addEventListener("click", () => playReferenceTone(string));
      item.append(number, pitch, button);
      return item;
    }),
  );
}

function renderTuningOptions() {
  tuningSelect.replaceChildren(
    ...tuningLibrary.map((tuning) => {
      const option = document.createElement("option");
      option.value = tuning.id;
      option.textContent = `${tuning.name} · ${tuning.notation}`;
      return option;
    }),
  );
  renderTuning();
}

function resetReading(message = "Play an open string") {
  detectedNote.textContent = "—";
  detectedFrequency.textContent = message;
  closestString.textContent = "The nearest target string will appear here.";
  centMeter.value = 0;
  centMeter.textContent = "0 cents";
  centReading.textContent = "Waiting for a note";
  gaugeNeedle.style.setProperty("--needle-angle", "0deg");
}

function closestTarget(frequency) {
  return activeTuning.strings.reduce((closest, string) => {
    const targetFrequency = frequencyForNote(string.note);
    const distance = Math.abs(1200 * Math.log2(frequency / targetFrequency));
    return !closest || distance < closest.distance ? { ...string, targetFrequency, distance } : closest;
  }, null);
}

function updateReading(frequency) {
  const concertPitch = getConcertPitch();
  const midiFloat = 69 + 12 * Math.log2(frequency / concertPitch);
  const midi = Math.round(midiFloat);
  const cents = Math.round((midiFloat - midi) * 100);
  const target = closestTarget(frequency);
  const chromaticNote = `${sharpNames[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;
  const noteName = target.distance <= 60 ? displayNote(target.note) : chromaticNote;
  const clampedCents = Math.min(50, Math.max(-50, cents));
  const isInTune = Math.abs(cents) <= 5;

  detectedNote.textContent = noteName;
  detectedFrequency.textContent = `${frequency.toFixed(1)} Hz`;
  closestString.textContent = `Closest target: string ${target.number} · ${displayNote(target.note)} · ${target.targetFrequency.toFixed(1)} Hz`;
  centMeter.value = clampedCents;
  centMeter.textContent = `${cents} cents`;
  centReading.textContent = isInTune ? "In tune" : `${Math.abs(cents)} cents ${cents < 0 ? "flat" : "sharp"}`;
  gaugeNeedle.style.setProperty("--needle-angle", `${clampedCents * 0.8}deg`);
}

function detectPitch(buffer, sampleRate) {
  let energy = 0;
  for (const sample of buffer) energy += sample * sample;
  if (Math.sqrt(energy / buffer.length) < 0.012) return null;

  const minimumLag = Math.floor(sampleRate / 700);
  const maximumLag = Math.min(Math.floor(sampleRate / 80), Math.floor(buffer.length / 2));
  const correlations = new Float32Array(maximumLag + 1);
  let bestCorrelation = 0;

  for (let lag = minimumLag; lag <= maximumLag; lag += 1) {
    let correlation = 0;
    let leftEnergy = 0;
    let rightEnergy = 0;
    const limit = buffer.length - lag;
    for (let index = 0; index < limit; index += 1) {
      const left = buffer[index];
      const right = buffer[index + lag];
      correlation += left * right;
      leftEnergy += left * left;
      rightEnergy += right * right;
    }
    correlation /= Math.sqrt(leftEnergy * rightEnergy) || 1;
    correlations[lag] = correlation;
    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
    }
  }

  if (bestCorrelation < 0.82) return null;

  const candidates = [];
  const threshold = Math.max(0.82, bestCorrelation * 0.9);
  for (let lag = minimumLag + 1; lag < maximumLag; lag += 1) {
    if (correlations[lag] >= threshold && correlations[lag] > correlations[lag - 1] && correlations[lag] >= correlations[lag + 1]) {
      candidates.push(sampleRate / lag);
    }
  }

  if (!candidates.length) return null;
  return candidates[0];
}

function analyzeMicrophone() {
  const buffer = new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(buffer);
  const frequency = detectPitch(buffer, audioContext.sampleRate);
  if (frequency) updateReading(frequency);
  animationFrame = requestAnimationFrame(analyzeMicrophone);
}

async function startTuner() {
  tunerError.textContent = "";
  if (!navigator.mediaDevices?.getUserMedia) {
    tunerError.textContent = "Microphone tuning is unavailable here. Open the deployed HTTPS site or use the reference tones.";
    return;
  }

  try {
    tunerToggle.disabled = true;
    tunerStatus.textContent = "Requesting microphone permission…";
    microphoneStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    });
    audioContext = new AudioContext();
    if (audioContext.state === "suspended") await audioContext.resume();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 4096;
    analyser.smoothingTimeConstant = 0;
    audioContext.createMediaStreamSource(microphoneStream).connect(analyser);
    tunerToggle.textContent = "Stop microphone";
    tunerToggle.setAttribute("aria-pressed", "true");
    tunerStatus.textContent = "Listening. Pluck one open string and let it ring.";
    analyzeMicrophone();
  } catch (error) {
    microphoneStream?.getTracks().forEach((track) => track.stop());
    microphoneStream = undefined;
    audioContext?.close();
    audioContext = undefined;
    tunerStatus.textContent = "Microphone is off.";
    tunerError.textContent = error.name === "NotAllowedError"
      ? "Microphone permission was denied. Allow microphone access in your browser settings and try again."
      : "The microphone could not be started. Check that another app is not using it, then try again.";
  } finally {
    tunerToggle.disabled = false;
  }
}

function stopTuner() {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  microphoneStream?.getTracks().forEach((track) => track.stop());
  audioContext?.close();
  animationFrame = undefined;
  microphoneStream = undefined;
  analyser = undefined;
  audioContext = undefined;
  tunerToggle.textContent = "Start microphone";
  tunerToggle.setAttribute("aria-pressed", "false");
  tunerStatus.textContent = "Microphone is off.";
  resetReading();
}

async function playReferenceTone(string) {
  referenceContext ??= new AudioContext();
  if (referenceContext.state === "suspended") await referenceContext.resume();
  if (activeReferenceOscillator) {
    try {
      activeReferenceOscillator.stop();
    } catch {
      // The previous reference tone has already stopped.
    }
  }

  const oscillator = referenceContext.createOscillator();
  const gain = referenceContext.createGain();
  const now = referenceContext.currentTime;
  oscillator.type = "sine";
  oscillator.frequency.value = frequencyForNote(string.note);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
  oscillator.connect(gain).connect(referenceContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 1.55);
  activeReferenceOscillator = oscillator;
  tunerStatus.textContent = `Playing string ${string.number}, ${displayNote(string.note)}, as a reference tone.`;
  oscillator.addEventListener("ended", () => {
    if (activeReferenceOscillator === oscillator) activeReferenceOscillator = undefined;
  });
}

tuningSelect.addEventListener("change", () => {
  activeTuning = tuningLibrary.find((tuning) => tuning.id === tuningSelect.value) ?? tuningLibrary[0];
  renderTuning();
  resetReading();
});

concertPitchInput.addEventListener("change", () => {
  getConcertPitch();
  renderTuning();
  resetReading("Concert pitch updated. Play an open string.");
});

tunerToggle.addEventListener("click", () => {
  if (microphoneStream) stopTuner();
  else startTuner();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden && microphoneStream) stopTuner();
});

renderTuningOptions();
resetReading();
