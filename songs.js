const songLibrary = {
  folk: [
    {
      title: "Man of Constant Sorrow",
      source: "Traditional song · beginner G study",
      description: "Hold an even roll through the repeated G measures, then prepare the C and D7 changes without breaking tempo.",
      bpm: 72,
      chords: ["G", "G", "C", "G", "G", "G", "D7", "G"],
    },
    {
      title: "Wildwood Flower",
      source: "Traditional song · beginner G study",
      description: "A gentle Carter-family standard adapted here as a steady three-chord accompaniment exercise.",
      bpm: 76,
      chords: ["G", "G", "D7", "G", "C", "G", "D7", "G"],
    },
    {
      title: "Oh! Susanna",
      source: "Stephen Foster · public-domain song",
      description: "Use the repeated tonic measures to settle the roll before moving through D7 and C.",
      bpm: 84,
      chords: ["G", "G", "D7", "D7", "G", "C", "D7", "G"],
    },
    {
      title: "Red River Valley",
      source: "Traditional song · beginner G study",
      description: "Practice smooth, unhurried chord changes while keeping every eighth note the same length.",
      bpm: 68,
      chords: ["G", "G", "D7", "G", "C", "G", "D7", "G"],
    },
  ],
  bluegrass: [
    {
      title: "Cripple Creek",
      source: "Traditional old-time tune · bluegrass study",
      description: "Start slowly and give the first beat a little weight while the forward roll stays relaxed.",
      bpm: 80,
      chords: ["G", "G", "G", "D7", "G", "G", "D7", "G"],
    },
    {
      title: "Old Joe Clark",
      source: "Traditional fiddle tune · bluegrass study",
      description: "Use the C measure as the landmark in the second half of this compact practice form.",
      bpm: 88,
      chords: ["G", "G", "D7", "G", "G", "C", "D7", "G"],
    },
    {
      title: "Nine Pound Hammer",
      source: "Traditional work song · bluegrass study",
      description: "Keep a strong square pulse and make the single C measure land cleanly before returning home.",
      bpm: 82,
      chords: ["G", "G", "C", "G", "G", "G", "D7", "G"],
    },
    {
      title: "Boil Them Cabbage Down",
      source: "Traditional fiddle tune · beginner study",
      description: "Frequent one-measure changes make this a useful first exercise for coordinating both hands.",
      bpm: 76,
      chords: ["G", "C", "G", "D7", "G", "C", "D7", "G"],
    },
    {
      title: "Shady Grove",
      source: "Traditional Appalachian song · minor study",
      description: "A simple E-minor form for hearing how the open fifth-string drone colors a minor progression.",
      bpm: 72,
      chords: ["Em", "Em", "D", "Em", "Em", "D", "Em", "Em"],
    },
  ],
  religious: [
    {
      title: "Amazing Grace",
      source: "Traditional hymn · public domain",
      description: "Let the slow tempo breathe. Aim for quiet, even notes rather than filling every beat with volume.",
      bpm: 60,
      chords: ["G", "G", "C", "G", "G", "D7", "G", "G"],
    },
    {
      title: "I’ll Fly Away",
      source: "Albert E. Brumley · public-domain song",
      description: "Build gentle drive through the G–C motion, then keep the Em and D7 changes light and clean.",
      bpm: 88,
      chords: ["G", "G", "C", "G", "G", "Em", "D7", "G"],
    },
    {
      title: "Will the Circle Be Unbroken",
      source: "Traditional gospel standard · beginner study",
      description: "Use this familiar three-chord form to practice singing or counting while the picking hand continues.",
      bpm: 76,
      chords: ["G", "G", "C", "G", "G", "Em", "D7", "G"],
    },
    {
      title: "In the Sweet By and By",
      source: "Joseph P. Webster · public-domain hymn",
      description: "A moderate hymn study with long G sections and clear C-to-D7 movement near the cadence.",
      bpm: 72,
      chords: ["G", "G", "C", "G", "G", "C", "D7", "G"],
    },
    {
      title: "Leaning on the Everlasting Arms",
      source: "Anthony J. Showalter · public-domain hymn",
      description: "Keep the roll buoyant and listen for a smooth transition from Em into the final D7 and G.",
      bpm: 82,
      chords: ["G", "C", "G", "G", "G", "Em", "D7", "G"],
    },
  ],
};

const chordFrets = {
  G: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  C: { 1: 2, 2: 1, 3: 0, 4: 2, 5: 0 },
  D7: { 1: 0, 2: 1, 3: 2, 4: 0, 5: 0 },
  D: { 1: 4, 2: 3, 3: 2, 4: 0, 5: 0 },
  Em: { 1: 2, 2: 0, 3: 0, 4: 2, 5: 0 },
};

const rollFingers = ["T", "I", "M", "T", "I", "M", "T", "M"];
const rollStrings = [3, 2, 1, 5, 2, 1, 5, 1];
const categoryTabs = [...document.querySelectorAll('[role="tab"][data-category]')];
const songPanel = document.querySelector("#song-panel");
const songSelect = document.querySelector("#song-select");
const songKey = document.querySelector("#song-key");
const songTempo = document.querySelector("#song-tempo");
const songSource = document.querySelector("#song-source");
const songTitle = document.querySelector("#song-title");
const songDescription = document.querySelector("#song-description");
const songProgression = document.querySelector("#song-progression");
const songTab = document.querySelector("#song-tab");
const bpmNumber = document.querySelector("#song-bpm-number");
const bpmRange = document.querySelector("#song-bpm-range");
const metronomeToggle = document.querySelector("#song-metronome-toggle");
const metronomeStatus = document.querySelector("#song-metronome-status");
const beatDots = document.querySelector("#song-beat-dots");
const audioHelp = document.querySelector("#song-audio-help");

let activeCategory = "folk";
let activeSong = songLibrary.folk[0];
let audioContext;
let metronomeRunning = false;
let schedulerTimer;
let nextClickTime = 0;
let scheduledBeat = 0;
let scheduledMeasure = 0;
let visualTimers = [];

function clampBpm(value) {
  const parsed = Number.parseInt(value, 10);
  return Math.min(220, Math.max(40, Number.isFinite(parsed) ? parsed : activeSong.bpm));
}

function syncBpm(value) {
  const bpm = clampBpm(value);
  bpmNumber.value = String(bpm);
  bpmRange.value = String(bpm);
  if (metronomeRunning) metronomeStatus.textContent = `Playing at ${bpm} BPM · measure ${scheduledMeasure + 1}`;
  return bpm;
}

function renderBeatDots(activeBeat = -1) {
  beatDots.replaceChildren(
    ...Array.from({ length: 4 }, (_, beat) => {
      const dot = document.createElement("i");
      dot.className = "song-beat-dot";
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

function setActiveMeasure(measureIndex = -1) {
  [...songProgression.children].forEach((measure, index) => measure.classList.toggle("is-active", index === measureIndex));
  [...songTab.children].forEach((measure, index) => measure.classList.toggle("is-active", index === measureIndex));
}

function createTabMeasure(chordName, measureIndex) {
  const frets = chordFrets[chordName];
  const measure = document.createElement("section");
  const heading = document.createElement("h4");
  const measureLabel = document.createElement("span");
  const chordLabel = document.createElement("strong");
  const staff = document.createElement("div");
  const fingerRow = document.createElement("div");
  const fingerLabel = document.createElement("span");

  measure.className = "song-tab-measure";
  measureLabel.textContent = `Measure ${measureIndex + 1}`;
  chordLabel.textContent = chordName;
  heading.append(measureLabel, chordLabel);
  staff.setAttribute("role", "img");
  staff.setAttribute(
    "aria-label",
    `Measure ${measureIndex + 1}, ${chordName} chord. Right hand ${rollFingers.join(", ")}. Strings ${rollStrings.join(", ")}. Frets ${rollStrings.map((string) => frets[string]).join(", ")}.`,
  );
  fingerRow.className = "song-finger-row";
  fingerLabel.className = "song-tab-label";
  fingerLabel.textContent = "RH";
  fingerRow.append(
    fingerLabel,
    ...rollFingers.map((finger) => {
      const cell = document.createElement("span");
      cell.textContent = finger;
      return cell;
    }),
  );
  staff.appendChild(fingerRow);

  for (let string = 1; string <= 5; string += 1) {
    const line = document.createElement("div");
    const label = document.createElement("span");
    line.className = "song-tab-line";
    label.className = "song-tab-label";
    label.textContent = String(string);
    line.appendChild(label);
    rollStrings.forEach((pickedString) => {
      const cell = document.createElement("span");
      cell.className = "song-tab-cell";
      if (pickedString === string) {
        const note = document.createElement("span");
        note.className = "song-tab-note";
        note.textContent = String(frets[string]);
        cell.appendChild(note);
      }
      line.appendChild(cell);
    });
    staff.appendChild(line);
  }

  measure.append(heading, staff);
  return measure;
}

function renderSong() {
  songKey.textContent = activeSong.chords.includes("Em") ? "G / E minor" : "G major";
  songTempo.textContent = `${activeSong.bpm} BPM`;
  songSource.textContent = activeSong.source;
  songTitle.textContent = activeSong.title;
  songDescription.textContent = activeSong.description;
  songProgression.replaceChildren(
    ...activeSong.chords.map((chord, index) => {
      const item = document.createElement("li");
      item.textContent = `${index + 1} · ${chord}`;
      return item;
    }),
  );
  songTab.replaceChildren(...activeSong.chords.map((chord, index) => createTabMeasure(chord, index)));
  syncBpm(activeSong.bpm);
  setActiveMeasure();
}

function renderSongOptions() {
  const songs = songLibrary[activeCategory];
  songSelect.replaceChildren(
    ...songs.map((song, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = song.title;
      return option;
    }),
  );
  activeSong = songs[0];
  renderSong();
}

function activateCategory(tab, moveFocus = false) {
  if (metronomeRunning) stopMetronome();
  categoryTabs.forEach((categoryTab) => {
    const selected = categoryTab === tab;
    categoryTab.setAttribute("aria-selected", String(selected));
    categoryTab.tabIndex = selected ? 0 : -1;
  });
  activeCategory = tab.dataset.category;
  songPanel.setAttribute("aria-labelledby", tab.id);
  renderSongOptions();
  if (moveFocus) tab.focus();
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

function scheduleVisual(time, beat, measure) {
  const delay = Math.max(0, (time - audioContext.currentTime) * 1000);
  let timer;
  timer = window.setTimeout(() => {
    renderBeatDots(beat);
    setActiveMeasure(measure);
    if (beat === 0) metronomeStatus.textContent = `Playing at ${clampBpm(bpmNumber.value)} BPM · measure ${measure + 1}`;
    visualTimers = visualTimers.filter((pendingTimer) => pendingTimer !== timer);
  }, delay);
  visualTimers.push(timer);
}

function scheduler() {
  const bpm = clampBpm(bpmNumber.value);
  while (nextClickTime < audioContext.currentTime + 0.1) {
    scheduleClick(nextClickTime, scheduledBeat === 0);
    scheduleVisual(nextClickTime, scheduledBeat, scheduledMeasure);
    nextClickTime += 60 / bpm;
    scheduledBeat += 1;
    if (scheduledBeat === 4) {
      scheduledBeat = 0;
      scheduledMeasure = (scheduledMeasure + 1) % activeSong.chords.length;
    }
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
  setActiveMeasure();
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
  scheduledMeasure = 0;
  nextClickTime = audioContext.currentTime + 0.05;
  metronomeStatus.textContent = `Playing at ${bpm} BPM · measure 1`;
  setToggleContent(true);
  scheduler();
  schedulerTimer = window.setInterval(scheduler, 25);
}

categoryTabs.forEach((tab) => tab.addEventListener("click", () => activateCategory(tab)));

document.querySelector(".category-tabs").addEventListener("keydown", (event) => {
  const currentTab = event.target.closest('[role="tab"]');
  if (!currentTab || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  const currentIndex = categoryTabs.indexOf(currentTab);
  let nextIndex = currentIndex;
  if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + categoryTabs.length) % categoryTabs.length;
  if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % categoryTabs.length;
  if (event.key === "Home") nextIndex = 0;
  if (event.key === "End") nextIndex = categoryTabs.length - 1;
  activateCategory(categoryTabs[nextIndex], true);
});

songSelect.addEventListener("change", () => {
  if (metronomeRunning) stopMetronome();
  activeSong = songLibrary[activeCategory][Number(songSelect.value)];
  renderSong();
});

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
    audioHelp.textContent = "The metronome could not start. Check this page’s audio permissions and try again.";
    console.error(error);
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden && metronomeRunning) stopMetronome();
});

renderBeatDots();
renderSongOptions();
