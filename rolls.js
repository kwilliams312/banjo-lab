const rolls = [
  {
    name: "Forward roll",
    description: "The foundational low-to-high cascade. Keep T–I–M even and resist accenting every thumb note.",
    fingers: ["T", "I", "M", "T", "I", "M", "T", "M"],
    strings: [3, 2, 1, 5, 2, 1, 5, 1],
  },
  {
    name: "Backward (reverse) roll",
    description: "A descending pattern that puts the first string in a strong melodic position.",
    fingers: ["M", "I", "T", "M", "I", "T", "M", "I"],
    strings: [1, 2, 5, 1, 2, 5, 1, 2],
  },
  {
    name: "Alternating-thumb roll",
    description: "Also called thumb-in-and-out. The alternating thumb creates a steady square pulse for backup playing.",
    fingers: ["T", "I", "T", "M", "T", "I", "T", "M"],
    strings: [3, 2, 5, 1, 4, 2, 5, 1],
  },
  {
    name: "Forward-reverse roll",
    description: "Climb through the first half, then reverse direction without interrupting the eighth-note flow.",
    fingers: ["T", "I", "M", "T", "M", "I", "T", "M"],
    strings: [3, 2, 1, 5, 1, 2, 3, 1],
  },
  {
    name: "Foggy Mountain roll",
    description: "An index-led Scruggs pattern with the thumb dropping to the second string for its characteristic drive.",
    fingers: ["I", "M", "T", "M", "T", "I", "M", "T"],
    strings: [2, 1, 2, 1, 5, 2, 1, 5],
  },
];

const exerciseChords = [
  { name: "G", frets: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
  { name: "C", frets: { 1: 2, 2: 1, 3: 0, 4: 2, 5: 0 } },
  { name: "D", frets: { 1: 4, 2: 3, 3: 2, 4: 0, 5: 0 } },
  { name: "G", frets: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
];

const rollList = document.querySelector("#roll-list");
const bpmNumber = document.querySelector("#roll-bpm-number");
const bpmRange = document.querySelector("#roll-bpm-range");
const metronomeToggle = document.querySelector("#roll-metronome-toggle");
const metronomeStatus = document.querySelector("#roll-metronome-status");
const beatDots = document.querySelector("#roll-beat-dots");
const audioHelp = document.querySelector("#roll-audio-help");

let audioContext;
let metronomeRunning = false;
let schedulerTimer;
let nextClickTime = 0;
let scheduledBeat = 0;
let visualTimers = [];

function clampBpm(value) {
  const parsed = Number.parseInt(value, 10);
  return Math.min(220, Math.max(40, Number.isFinite(parsed) ? parsed : 80));
}

function syncBpm(value) {
  const bpm = clampBpm(value);
  bpmNumber.value = String(bpm);
  bpmRange.value = String(bpm);
  if (metronomeRunning) metronomeStatus.textContent = `Playing at ${bpm} BPM`;
  return bpm;
}

function renderBeatDots(activeBeat = -1) {
  beatDots.replaceChildren(
    ...Array.from({ length: 4 }, (_, beat) => {
      const dot = document.createElement("i");
      dot.className = "roll-beat-dot";
      if (beat === 0) dot.classList.add("is-downbeat");
      if (beat === activeBeat) dot.classList.add("is-active");
      return dot;
    }),
  );
}

function setToggleContent(running) {
  const icon = document.createElement("span");
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = running ? "■" : "▶";
  metronomeToggle.replaceChildren(icon, running ? " Stop metronome" : " Start metronome");
  metronomeToggle.setAttribute("aria-pressed", String(running));
}

function scheduleClick(time, accented) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.frequency.value = accented ? 1000 : 720;
  gain.gain.setValueAtTime(accented ? 0.22 : 0.15, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(time);
  oscillator.stop(time + 0.05);
}

function scheduleBeatIndicator(time, beat) {
  const delay = Math.max(0, (time - audioContext.currentTime) * 1000);
  let timer;
  timer = window.setTimeout(() => {
    renderBeatDots(beat);
    visualTimers = visualTimers.filter((pendingTimer) => pendingTimer !== timer);
  }, delay);
  visualTimers.push(timer);
}

function scheduler() {
  const bpm = clampBpm(bpmNumber.value);
  while (nextClickTime < audioContext.currentTime + 0.1) {
    scheduleClick(nextClickTime, scheduledBeat === 0);
    scheduleBeatIndicator(nextClickTime, scheduledBeat);
    nextClickTime += 60 / bpm;
    scheduledBeat = (scheduledBeat + 1) % 4;
  }
}

function stopMetronome() {
  window.clearInterval(schedulerTimer);
  visualTimers.forEach((timer) => window.clearTimeout(timer));
  visualTimers = [];
  metronomeRunning = false;
  metronomeStatus.textContent = "Stopped";
  setToggleContent(false);
  renderBeatDots();
}

async function startMetronome() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    audioHelp.textContent = "This browser does not support the Web Audio metronome.";
    return;
  }

  audioHelp.textContent = "";
  audioContext ||= new AudioContextClass();
  if (audioContext.state === "suspended") await audioContext.resume();

  const bpm = syncBpm(bpmNumber.value);
  metronomeRunning = true;
  scheduledBeat = 0;
  nextClickTime = audioContext.currentTime + 0.05;
  metronomeStatus.textContent = `Playing at ${bpm} BPM`;
  setToggleContent(true);
  scheduler();
  schedulerTimer = window.setInterval(scheduler, 25);
}

function createTabMeasure(roll, chord) {
  const measure = document.createElement("section");
  const heading = document.createElement("h4");
  const staff = document.createElement("div");
  const fingerRow = document.createElement("div");
  const fingerLabel = document.createElement("span");

  measure.className = "tab-measure";
  heading.textContent = `${chord.name} chord`;
  staff.setAttribute(
    "aria-label",
    `${chord.name} chord. Right hand ${roll.fingers.join(", ")}. Strings ${roll.strings.join(", ")}. Frets ${roll.strings.map((string) => chord.frets[string]).join(", ")}.`,
  );
  staff.setAttribute("role", "img");
  fingerRow.className = "finger-row";
  fingerLabel.className = "tab-line-label";
  fingerLabel.textContent = "RH";
  fingerRow.append(
    fingerLabel,
    ...roll.fingers.map((finger) => {
      const cell = document.createElement("span");
      cell.textContent = finger;
      return cell;
    }),
  );
  staff.appendChild(fingerRow);

  for (let string = 1; string <= 5; string += 1) {
    const line = document.createElement("div");
    const label = document.createElement("span");
    line.className = "tab-line";
    label.className = "tab-line-label";
    label.textContent = String(string);
    line.appendChild(label);

    roll.strings.forEach((pickedString) => {
      const cell = document.createElement("span");
      cell.className = "tab-cell";
      if (pickedString === string) {
        const note = document.createElement("span");
        note.className = "tab-note";
        note.textContent = String(chord.frets[string]);
        cell.appendChild(note);
      }
      line.appendChild(cell);
    });
    staff.appendChild(line);
  }

  measure.append(heading, staff);
  return measure;
}

function renderRolls() {
  rollList.replaceChildren(
    ...rolls.map((roll) => {
      const item = document.createElement("li");
      const heading = document.createElement("div");
      const copy = document.createElement("div");
      const title = document.createElement("h3");
      const description = document.createElement("p");
      const sequence = document.createElement("div");
      const sequenceLabel = document.createElement("b");
      const measures = document.createElement("div");
      const tip = document.createElement("p");

      item.className = "roll-exercise";
      heading.className = "roll-heading";
      sequence.className = "roll-sequence";
      measures.className = "tab-exercise";
      tip.className = "exercise-tip";
      title.textContent = roll.name;
      description.textContent = roll.description;
      sequenceLabel.textContent = "Pattern";
      sequence.append(sequenceLabel, `${roll.fingers.join("–")} · strings ${roll.strings.join("–")}`);
      copy.append(title, description);
      heading.append(copy, sequence);
      measures.append(...exerciseChords.map((chord) => createTabMeasure(roll, chord)));
      tip.textContent = "Practice path: play each measure four times, then connect all four without stopping. Begin slowly and increase the tempo only when every note is even.";
      item.append(heading, measures, tip);
      return item;
    }),
  );
}

renderRolls();
renderBeatDots();

bpmNumber.addEventListener("change", () => syncBpm(bpmNumber.value));
bpmRange.addEventListener("input", () => syncBpm(bpmRange.value));
metronomeToggle.addEventListener("click", async () => {
  if (metronomeRunning) {
    stopMetronome();
    return;
  }

  try {
    await startMetronome();
  } catch (error) {
    stopMetronome();
    audioHelp.textContent = "The metronome could not start. Check this page's audio permissions and try again.";
    console.error(error);
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden && metronomeRunning) stopMetronome();
});
