const { keys, degrees } = window.BANJO_THEORY;

const exercises = [
  { name: "Three-chord foundation", description: "The essential home, away, and turnaround movement.", sequence: [0, 3, 4, 0] },
  { name: "Bluegrass turnaround", description: "A familiar progression for backup and song endings.", sequence: [0, 5, 3, 4] },
  { name: "Circle movement", description: "Practice smooth voice leading through ii–V–I–vi.", sequence: [1, 4, 0, 5] },
  { name: "Full key ladder", description: "Touch every diatonic chord, then resolve home.", sequence: [0, 1, 2, 3, 4, 5, 6, 0] },
];

const practiceKeyName = document.querySelector("#practice-key-name");
const keySelect = document.querySelector("#key-select");
const keySignature = document.querySelector("#key-signature");
const practiceChords = document.querySelector("#practice-chords");
const exerciseList = document.querySelector("#exercise-list");
const playerTitle = document.querySelector("#player-title");
const playbackStatus = document.querySelector("#playback-status");
const activeSequence = document.querySelector("#active-sequence");
const currentChord = document.querySelector("#current-chord");
const beatDots = document.querySelector("#beat-dots");
const bpmNumber = document.querySelector("#bpm-number");
const bpmRange = document.querySelector("#bpm-range");
const beatsPerChordSelect = document.querySelector("#beats-per-chord");
const metronomeToggle = document.querySelector("#metronome-toggle");
const audioHelp = document.querySelector("#audio-help");

const queryKey = Number(new URLSearchParams(window.location.search).get("key"));
let selectedKeyIndex = Number.isInteger(queryKey) && queryKey >= 0 && queryKey < keys.length ? queryKey : 1;
let selectedExerciseIndex = 0;
let isRunning = false;
let audioContext;
let schedulerTimer;
let nextNoteTime = 0;
let scheduledBeat = 0;
let scheduledChordIndex = 0;
let visualTimers = [];

function chordQuality(degreeIndex) {
  if (degreeIndex === 6) return "diminished";
  if ([1, 2, 5].includes(degreeIndex)) return "minor";
  return "major";
}

function selectedKey() {
  return keys[selectedKeyIndex];
}

function selectedExercise() {
  return exercises[selectedExerciseIndex];
}

function renderKeyOptions() {
  keySelect.replaceChildren(
    ...keys.map((key, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = `${key.major} major`;
      return option;
    }),
  );
  keySelect.value = String(selectedKeyIndex);
}

function renderChordReference() {
  const key = selectedKey();
  practiceChords.replaceChildren(
    ...key.chords.map((chord, degreeIndex) => {
      const item = document.createElement("li");
      const numeral = document.createElement("b");
      const chordName = document.createElement("strong");
      const quality = document.createElement("small");
      item.className = "reference-chord";
      numeral.textContent = degrees[degreeIndex];
      chordName.textContent = chord;
      quality.textContent = chordQuality(degreeIndex);
      item.append(numeral, chordName, quality);
      return item;
    }),
  );
}

function sequenceLabel(exercise) {
  const key = selectedKey();
  return exercise.sequence.map((degreeIndex) => key.chords[degreeIndex]).join("  →  ");
}

function renderExerciseList() {
  exerciseList.replaceChildren(
    ...exercises.map((exercise, exerciseIndex) => {
      const button = document.createElement("button");
      const name = document.createElement("strong");
      const sequence = document.createElement("span");
      button.type = "button";
      button.className = "exercise-card";
      button.dataset.exercise = String(exerciseIndex);
      button.setAttribute("aria-pressed", String(exerciseIndex === selectedExerciseIndex));
      name.textContent = exercise.name;
      sequence.textContent = sequenceLabel(exercise);
      button.append(name, sequence);
      return button;
    }),
  );
}

function renderActiveSequence(activeChordIndex = 0) {
  const key = selectedKey();
  const exercise = selectedExercise();
  playerTitle.textContent = exercise.name;
  activeSequence.replaceChildren(
    ...exercise.sequence.map((degreeIndex, sequenceIndex) => {
      const item = document.createElement("li");
      const numeral = document.createElement("b");
      const chord = document.createElement("span");
      item.className = `sequence-chord${sequenceIndex === activeChordIndex ? " is-active" : ""}`;
      if (sequenceIndex === activeChordIndex) item.setAttribute("aria-current", "step");
      numeral.textContent = degrees[degreeIndex];
      chord.textContent = key.chords[degreeIndex];
      item.append(numeral, chord);
      return item;
    }),
  );
  const activeDegree = exercise.sequence[activeChordIndex];
  currentChord.textContent = key.chords[activeDegree];
}

function renderBeatDots(activeBeat = -1) {
  const beatCount = Number(beatsPerChordSelect.value);
  beatDots.replaceChildren(
    ...Array.from({ length: beatCount }, (_, beatIndex) => {
      const dot = document.createElement("i");
      dot.className = `beat-dot${beatIndex === activeBeat ? " is-active" : ""}`;
      return dot;
    }),
  );
}

function renderKey() {
  const key = selectedKey();
  practiceKeyName.textContent = `${key.major} major`;
  keySignature.textContent = `${key.signature} · relative ${key.minor} minor`;
  document.title = `${key.major} Major Banjo Practice`;
  renderChordReference();
  renderExerciseList();
  renderActiveSequence();
  renderBeatDots();
}

function clampBpm(value) {
  return Math.min(220, Math.max(40, Number(value) || 90));
}

function syncBpm(value) {
  const bpm = clampBpm(value);
  bpmNumber.value = String(bpm);
  bpmRange.value = String(bpm);
}

function scheduleClick(time, accented) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.frequency.value = accented ? 1000 : 720;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(accented ? 0.35 : 0.2, time + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.045);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(time);
  oscillator.stop(time + 0.05);
}

function scheduleVisual(time, chordIndex, beatIndex) {
  const delay = Math.max(0, (time - audioContext.currentTime) * 1000);
  const timer = window.setTimeout(() => {
    if (beatIndex === 0) renderActiveSequence(chordIndex);
    renderBeatDots(beatIndex);
  }, delay);
  visualTimers.push(timer);
}

function scheduler() {
  const exercise = selectedExercise();
  const beatsPerChord = Number(beatsPerChordSelect.value);
  while (nextNoteTime < audioContext.currentTime + 0.1) {
    const accented = scheduledBeat === 0;
    scheduleClick(nextNoteTime, accented);
    scheduleVisual(nextNoteTime, scheduledChordIndex, scheduledBeat);
    nextNoteTime += 60 / Number(bpmNumber.value);
    scheduledBeat += 1;
    if (scheduledBeat >= beatsPerChord) {
      scheduledBeat = 0;
      scheduledChordIndex = (scheduledChordIndex + 1) % exercise.sequence.length;
    }
  }
}

function stopMetronome() {
  if (schedulerTimer) window.clearInterval(schedulerTimer);
  visualTimers.forEach((timer) => window.clearTimeout(timer));
  visualTimers = [];
  schedulerTimer = undefined;
  isRunning = false;
  metronomeToggle.setAttribute("aria-pressed", "false");
  metronomeToggle.innerHTML = '<span aria-hidden="true">▶</span> Start metronome';
  playbackStatus.textContent = "Stopped";
  playbackStatus.classList.remove("is-running");
  renderActiveSequence();
  renderBeatDots();
}

async function startMetronome() {
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextConstructor) {
    audioHelp.textContent = "This browser does not support metronome audio. Try a current version of Chrome, Safari, Firefox, or Edge.";
    return;
  }

  syncBpm(bpmNumber.value);
  audioContext ||= new AudioContextConstructor();
  if (audioContext.state === "suspended") await audioContext.resume();
  isRunning = true;
  scheduledBeat = 0;
  scheduledChordIndex = 0;
  nextNoteTime = audioContext.currentTime + 0.06;
  metronomeToggle.setAttribute("aria-pressed", "true");
  metronomeToggle.innerHTML = '<span aria-hidden="true">■</span> Stop metronome';
  playbackStatus.textContent = `Playing at ${bpmNumber.value} BPM`;
  playbackStatus.classList.add("is-running");
  scheduler();
  schedulerTimer = window.setInterval(scheduler, 25);
}

keySelect.addEventListener("change", () => {
  if (isRunning) stopMetronome();
  selectedKeyIndex = Number(keySelect.value);
  const url = new URL(window.location.href);
  url.searchParams.set("key", String(selectedKeyIndex));
  window.history.replaceState({}, "", url);
  renderKey();
});

exerciseList.addEventListener("click", (event) => {
  const button = event.target.closest(".exercise-card");
  if (!button) return;
  if (isRunning) stopMetronome();
  selectedExerciseIndex = Number(button.dataset.exercise);
  renderExerciseList();
  renderActiveSequence();
});

bpmNumber.addEventListener("change", () => {
  syncBpm(bpmNumber.value);
  if (isRunning) playbackStatus.textContent = `Playing at ${bpmNumber.value} BPM`;
});
bpmRange.addEventListener("input", () => {
  syncBpm(bpmRange.value);
  if (isRunning) playbackStatus.textContent = `Playing at ${bpmNumber.value} BPM`;
});

beatsPerChordSelect.addEventListener("change", () => {
  if (isRunning) stopMetronome();
  renderBeatDots();
});

metronomeToggle.addEventListener("click", () => {
  if (isRunning) stopMetronome();
  else startMetronome().catch(() => {
    audioHelp.textContent = "The metronome could not start. Check that this page is allowed to play audio, then try again.";
  });
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden && isRunning) stopMetronome();
});

renderKeyOptions();
renderKey();
