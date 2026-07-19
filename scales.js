const scaleRoots = [
  { name: "C", pitch: 0 },
  { name: "C♯", pitch: 1 },
  { name: "D♭", pitch: 1 },
  { name: "D", pitch: 2 },
  { name: "D♯", pitch: 3 },
  { name: "E♭", pitch: 3 },
  { name: "E", pitch: 4 },
  { name: "F", pitch: 5 },
  { name: "F♯", pitch: 6 },
  { name: "G♭", pitch: 6 },
  { name: "G", pitch: 7 },
  { name: "G♯", pitch: 8 },
  { name: "A♭", pitch: 8 },
  { name: "A", pitch: 9 },
  { name: "A♯", pitch: 10 },
  { name: "B♭", pitch: 10 },
  { name: "B", pitch: 11 },
];

const scaleTypes = [
  {
    id: "major",
    name: "Major",
    intervals: [0, 2, 4, 5, 7, 9, 11],
    degrees: ["1", "2", "3", "4", "5", "6", "7"],
    letterSteps: [0, 1, 2, 3, 4, 5, 6],
    character: "Bright, settled, and complete—the foundation of major-key melody and harmony.",
  },
  {
    id: "natural-minor",
    name: "Natural minor",
    intervals: [0, 2, 3, 5, 7, 8, 10],
    degrees: ["1", "2", "♭3", "4", "5", "♭6", "♭7"],
    letterSteps: [0, 1, 2, 3, 4, 5, 6],
    character: "Dark and direct, with lowered third, sixth, and seventh degrees.",
  },
  {
    id: "harmonic-minor",
    name: "Harmonic minor",
    intervals: [0, 2, 3, 5, 7, 8, 11],
    degrees: ["1", "2", "♭3", "4", "5", "♭6", "7"],
    letterSteps: [0, 1, 2, 3, 4, 5, 6],
    character: "Natural minor with a raised seventh, creating a strong pull back to the root.",
  },
  {
    id: "melodic-minor",
    name: "Melodic minor",
    intervals: [0, 2, 3, 5, 7, 9, 11],
    degrees: ["1", "2", "♭3", "4", "5", "6", "7"],
    letterSteps: [0, 1, 2, 3, 4, 5, 6],
    character: "Minor with raised sixth and seventh degrees on the way up for a smoother melodic climb.",
  },
  {
    id: "major-pentatonic",
    name: "Major pentatonic",
    intervals: [0, 2, 4, 7, 9],
    degrees: ["1", "2", "3", "5", "6"],
    letterSteps: [0, 1, 2, 4, 5],
    character: "Open and singable. A dependable choice for major-key breaks and simple fills.",
  },
  {
    id: "minor-pentatonic",
    name: "Minor pentatonic",
    intervals: [0, 3, 5, 7, 10],
    degrees: ["1", "♭3", "4", "5", "♭7"],
    letterSteps: [0, 2, 3, 4, 6],
    character: "Earthy and flexible, with the essential minor and blues color tones.",
  },
  {
    id: "blues",
    name: "Blues",
    intervals: [0, 3, 5, 6, 7, 10],
    degrees: ["1", "♭3", "4", "♭5", "5", "♭7"],
    letterSteps: [0, 2, 3, 4, 4, 6],
    character: "Minor pentatonic with an added flat fifth for tension, slides, and blues phrasing.",
  },
  {
    id: "mixolydian",
    name: "Mixolydian",
    intervals: [0, 2, 4, 5, 7, 9, 10],
    degrees: ["1", "2", "3", "4", "5", "6", "♭7"],
    letterSteps: [0, 1, 2, 3, 4, 5, 6],
    character: "Major with a flat seventh—the classic sound over dominant chords and many fiddle tunes.",
  },
  {
    id: "dorian",
    name: "Dorian",
    intervals: [0, 2, 3, 5, 7, 9, 10],
    degrees: ["1", "2", "♭3", "4", "5", "6", "♭7"],
    letterSteps: [0, 1, 2, 3, 4, 5, 6],
    character: "Minor with a natural sixth, giving modal tunes a brighter, driving lift.",
  },
  {
    id: "phrygian",
    name: "Phrygian",
    intervals: [0, 1, 3, 5, 7, 8, 10],
    degrees: ["1", "♭2", "♭3", "4", "5", "♭6", "♭7"],
    letterSteps: [0, 1, 2, 3, 4, 5, 6],
    character: "A dark minor mode whose flat second gives melodies immediate tension.",
  },
  {
    id: "lydian",
    name: "Lydian",
    intervals: [0, 2, 4, 6, 7, 9, 11],
    degrees: ["1", "2", "3", "♯4", "5", "6", "7"],
    letterSteps: [0, 1, 2, 3, 4, 5, 6],
    character: "A major mode with a raised fourth, producing a spacious, floating sound.",
  },
  {
    id: "locrian",
    name: "Locrian",
    intervals: [0, 1, 3, 5, 6, 8, 10],
    degrees: ["1", "♭2", "♭3", "4", "♭5", "♭6", "♭7"],
    letterSteps: [0, 1, 2, 3, 4, 5, 6],
    character: "An unstable minor mode with a flat second and flat fifth; useful for hearing tension clearly.",
  },
];

const naturalPitches = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const noteLetters = ["C", "D", "E", "F", "G", "A", "B"];
const longStrings = [
  { number: 4, openName: "D", midi: 50 },
  { number: 3, openName: "G", midi: 55 },
  { number: 2, openName: "B", midi: 59 },
  { number: 1, openName: "D", midi: 62 },
];

const rootSelect = document.querySelector("#scale-root");
const typeSelect = document.querySelector("#scale-type");
const selectedScaleName = document.querySelector("#selected-scale-name");
const scaleCharacter = document.querySelector("#scale-character");
const scaleFormula = document.querySelector("#scale-formula");
const scaleNotes = document.querySelector("#scale-notes");
const droneStatus = document.querySelector("#drone-status");
const fretboard = document.querySelector("#scale-fretboard");
const scalePath = document.querySelector("#scale-path");

function accidentalForDifference(difference) {
  const normalized = ((difference + 18) % 12) - 6;
  if (normalized === 0) return "";
  if (normalized === 1) return "♯";
  if (normalized === 2) return "𝄪";
  if (normalized === -1) return "♭";
  if (normalized === -2) return "𝄫";
  return normalized > 0 ? "♯".repeat(normalized) : "♭".repeat(Math.abs(normalized));
}

function spellScale(root, type) {
  const rootLetterIndex = noteLetters.indexOf(root.name[0]);
  return type.intervals.map((interval, index) => {
    const letter = noteLetters[(rootLetterIndex + type.letterSteps[index]) % noteLetters.length];
    const pitch = (root.pitch + interval) % 12;
    return `${letter}${accidentalForDifference(pitch - naturalPitches[letter])}`;
  });
}

function currentSelection() {
  return {
    root: scaleRoots[Number(rootSelect.value)],
    type: scaleTypes[Number(typeSelect.value)],
  };
}

function createFretboardRange(startFret, endFret, root, type, noteNames) {
  const region = document.createElement("section");
  const heading = document.createElement("h3");
  const grid = document.createElement("div");
  const fretNumbers = Array.from({ length: endFret - startFret + 1 }, (_, index) => startFret + index);
  const scalePitchClasses = type.intervals.map((interval) => (root.pitch + interval) % 12);

  region.className = "fretboard-region";
  heading.textContent = startFret === 0 ? "Open through fret 5" : `Frets ${startFret}–${endFret}`;
  grid.className = "fretboard-grid";
  grid.style.setProperty("--fret-count", String(fretNumbers.length));
  grid.setAttribute("role", "img");
  grid.setAttribute("aria-label", `${root.name} ${type.name.toLowerCase()} notes on strings 4 through 1, frets ${startFret} through ${endFret}.`);

  const corner = document.createElement("span");
  corner.className = "fretboard-corner";
  corner.textContent = "String";
  grid.appendChild(corner);
  fretNumbers.forEach((fret) => {
    const label = document.createElement("span");
    label.className = "fret-number";
    label.textContent = fret === 0 ? "Open" : String(fret);
    grid.appendChild(label);
  });

  longStrings.forEach((string) => {
    const stringLabel = document.createElement("span");
    stringLabel.className = "string-label";
    stringLabel.textContent = `${string.number} · ${string.openName}`;
    grid.appendChild(stringLabel);

    fretNumbers.forEach((fret) => {
      const cell = document.createElement("span");
      const pitch = (string.midi + fret) % 12;
      const scaleIndex = scalePitchClasses.indexOf(pitch);
      cell.className = "fret-cell";
      if (scaleIndex >= 0) {
        const note = document.createElement("span");
        const noteName = document.createElement("strong");
        const degree = document.createElement("small");
        note.className = `fret-note${type.intervals[scaleIndex] === 0 ? " is-root" : ""}`;
        noteName.textContent = noteNames[scaleIndex];
        degree.textContent = type.degrees[scaleIndex];
        note.append(noteName, degree);
        cell.appendChild(note);
      }
      grid.appendChild(cell);
    });
  });

  region.append(heading, grid);
  return region;
}

function findPosition(midi) {
  return longStrings
    .map((string) => ({ string: string.number, fret: midi - string.midi }))
    .filter((position) => position.fret >= 0 && position.fret <= 12)
    .sort((a, b) => a.fret - b.fret || a.string - b.string)[0];
}

function fingerForFret(fret) {
  if (fret === 0) return 0;
  return ((fret - 1) % 4) + 1;
}

function renderPath(root, type, noteNames) {
  let rootMidi = longStrings[0].midi;
  while (rootMidi % 12 !== root.pitch) rootMidi += 1;
  const pathIntervals = [...type.intervals, 12];
  const pathNotes = [...noteNames, noteNames[0]];
  const pathDegrees = [...type.degrees, "8"];

  scalePath.replaceChildren(
    ...pathIntervals.map((interval, index) => {
      const position = findPosition(rootMidi + interval);
      const finger = fingerForFret(position.fret);
      const item = document.createElement("li");
      const step = document.createElement("span");
      const note = document.createElement("strong");
      const location = document.createElement("span");
      const fingering = document.createElement("span");

      if (index === 0 || index === pathIntervals.length - 1) item.classList.add("is-root");
      step.className = "path-degree";
      step.textContent = pathDegrees[index];
      note.textContent = pathNotes[index];
      location.textContent = `String ${position.string} · fret ${position.fret}`;
      fingering.textContent = finger === 0 ? "Open" : `Finger ${finger}`;
      item.append(step, note, location, fingering);
      return item;
    }),
  );
}

function renderScale() {
  const { root, type } = currentSelection();
  const noteNames = spellScale(root, type);
  const includesDrone = type.intervals.some((interval) => (root.pitch + interval) % 12 === 7);

  selectedScaleName.textContent = `${root.name} ${type.name.toLowerCase()}`;
  scaleCharacter.textContent = type.character;
  scaleFormula.textContent = type.degrees.join(" · ");
  scaleNotes.textContent = noteNames.join(" · ");
  droneStatus.textContent = includesDrone ? "G belongs to this scale" : "G is outside this scale";
  fretboard.replaceChildren(
    createFretboardRange(0, 5, root, type, noteNames),
    createFretboardRange(6, 12, root, type, noteNames),
  );
  renderPath(root, type, noteNames);
}

rootSelect.replaceChildren(
  ...scaleRoots.map((root, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = root.name;
    option.selected = root.name === "G";
    return option;
  }),
);

typeSelect.replaceChildren(
  ...scaleTypes.map((type, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = type.name;
    return option;
  }),
);

rootSelect.addEventListener("change", renderScale);
typeSelect.addEventListener("change", renderScale);
renderScale();
