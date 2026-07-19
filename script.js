const { keys, degrees } = window.BANJO_THEORY;

const svg = document.querySelector("#circle-chart");
const wheel = document.querySelector("#rotating-wheel");
const rotateLeft = document.querySelector("#rotate-left");
const rotateRight = document.querySelector("#rotate-right");
const keyName = document.querySelector("#key-name");
const minorName = document.querySelector("#minor-name");
const signature = document.querySelector("#signature");
const dominant = document.querySelector("#dominant");
const subdominant = document.querySelector("#subdominant");
const degreeList = document.querySelector("#degree-list");
const pentatonicList = document.querySelector("#pentatonic-list");
const practiceLink = document.querySelector("#practice-link");
const practiceLinkLabel = document.querySelector("#practice-link-label");
const banjoKeyName = document.querySelector("#banjo-key-name");
const banjoChordName = document.querySelector("#banjo-chord-name");
const chordTabs = document.querySelector("#chord-tabs");
const chordPanel = document.querySelector("#chord-panel");
const banjoShapes = document.querySelector("#banjo-shapes");

const rootPitchClasses = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5];
const majorScaleIntervals = [0, 2, 4, 5, 7, 9, 11];
const banjoShapeDefinitions = [
  { name: "Barre", inversion: "2nd inversion" },
  { name: "F shape", inversion: "Root position" },
  { name: "D shape", inversion: "1st inversion" },
];
const voicingDegrees = {
  major: ["5–1–3–5", "1–3–5–1", "3–5–1–3"],
  minor: ["5–1–♭3–5", "1–♭3–5–1", "♭3–5–1–♭3"],
  diminished: ["♭5–1–♭3–♭5", "1–♭3–♭5–1", "♭3–♭5–1–♭3"],
};
const recommendedFingerings = {
  major: [
    [1, 1, 1, 1],
    [3, 2, 1, 4],
    [3, 1, 2, 4],
  ],
  minor: [
    [2, 3, 1, 4],
    [3, 1, 1, 4],
    [2, 1, 3, 4],
  ],
  diminished: [
    [1, 2, 1, 1],
    [3, 2, 1, 4],
    [2, 1, 3, 4],
  ],
};

const center = 320;
const outerRadius = 300;
const middleRadius = 205;
const innerRadius = 92;
const sliceAngle = 360 / keys.length;
let rotation = 0;
let selectedIndex = 0;
let isDragging = false;
let previousPointerAngle = 0;
let dragDistance = 0;

function polarPoint(radius, angle) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: center + radius * Math.cos(radians),
    y: center + radius * Math.sin(radians),
  };
}

function ringPath(inner, outer, startAngle, endAngle) {
  const outerStart = polarPoint(outer, startAngle);
  const outerEnd = polarPoint(outer, endAngle);
  const innerEnd = polarPoint(inner, endAngle);
  const innerStart = polarPoint(inner, startAngle);
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outer} ${outer} 0 0 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${inner} ${inner} 0 0 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

function labelPoint(radius, angle) {
  const point = polarPoint(radius, angle);
  return `${point.x},${point.y}`;
}

function readableLabelRotation(angle) {
  return angle > 90 && angle < 270 ? angle + 180 : angle;
}

function chordRoot(chord) {
  return chord.replaceAll("m", "").replaceAll("°", "");
}

function accidentalFamily(index) {
  if (index === 0) return "No accidentals";
  if (index < 7) return "Sharp key";
  return "Flat key";
}

function createPentatonicRow(name, quality, spelling, notes) {
  const row = document.createElement("div");
  const copy = document.createElement("p");
  const nameLine = document.createElement("span");
  const scaleName = document.createElement("strong");
  const qualityBadge = document.createElement("span");
  const spellingBadge = document.createElement("span");
  const formula = document.createElement("small");
  const noteList = document.createElement("ol");

  row.className = `pentatonic-row is-${quality.toLowerCase()}`;
  nameLine.className = "pentatonic-name";
  qualityBadge.className = "scale-quality";
  spellingBadge.className = "scale-spelling";
  scaleName.textContent = name;
  qualityBadge.textContent = quality;
  spellingBadge.textContent = spelling;
  formula.textContent = quality === "Major" ? "1 · 2 · 3 · 5 · 6" : "1 · ♭3 · 4 · 5 · ♭7";
  noteList.setAttribute("aria-label", `${name} ${quality.toLowerCase()} pentatonic notes, ${spelling.toLowerCase()}`);

  noteList.append(
    ...notes.map((note) => {
      const item = document.createElement("li");
      item.classList.toggle("is-long", note.length > 5);
      item.textContent = note;
      return item;
    }),
  );
  nameLine.append(scaleName, qualityBadge, spellingBadge);
  copy.append(nameLine, formula);
  row.append(copy, noteList);
  return row;
}

function renderPentatonicScales(key, index) {
  const scaleNotes = key.chords.map(chordRoot);
  const majorNotes = [0, 1, 2, 4, 5].map((noteIndex) => scaleNotes[noteIndex]);
  const minorNotes = [5, 0, 1, 2, 4].map((noteIndex) => scaleNotes[noteIndex]);

  if (index === 6) {
    const sharpNotes = (notes) => notes.map((note) => note.split(" / ")[0]);
    const flatNotes = (notes) => notes.map((note) => note.split(" / ")[1]);
    pentatonicList.replaceChildren(
      createPentatonicRow("F♯", "Major", "Sharp spelling", sharpNotes(majorNotes)),
      createPentatonicRow("D♯", "Minor", "Sharp spelling", sharpNotes(minorNotes)),
      createPentatonicRow("G♭", "Major", "Flat spelling", flatNotes(majorNotes)),
      createPentatonicRow("E♭", "Minor", "Flat spelling", flatNotes(minorNotes)),
    );
    return;
  }

  const spelling = accidentalFamily(index);
  pentatonicList.replaceChildren(
    createPentatonicRow(key.major, "Major", spelling, majorNotes),
    createPentatonicRow(key.minor, "Minor", spelling, minorNotes),
  );
}

function modulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

function getBanjoFrets(rootPitchClass) {
  const barreFret = modulo(rootPitchClass - 7, 12);
  let fShapeFret = modulo(rootPitchClass - 2, 12);
  let dShapeFret = modulo(rootPitchClass - 11, 12) + 1;

  if (fShapeFret < 2) fShapeFret += 12;
  if (dShapeFret < 2) dShapeFret += 12;

  return [
    [barreFret, barreFret, barreFret, barreFret],
    [fShapeFret, fShapeFret - 1, fShapeFret - 2, fShapeFret],
    [dShapeFret, dShapeFret - 2, dShapeFret - 1, dShapeFret],
  ];
}

function chordQuality(degreeIndex) {
  if (degreeIndex === 6) return "diminished";
  if ([1, 2, 5].includes(degreeIndex)) return "minor";
  return "major";
}

function getChordShapeFrets(rootPitchClass, quality) {
  const majorShapes = getBanjoFrets(rootPitchClass);
  const alterations = {
    major: [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    minor: [
      [0, 0, -1, 0],
      [0, -1, 0, 0],
      [-1, 0, 0, -1],
    ],
    diminished: [
      [-1, 0, -1, -1],
      [0, -1, -1, 0],
      [-1, -1, 0, -1],
    ],
  };

  return majorShapes.map((shape, shapeIndex) => {
    const change = alterations[quality][shapeIndex];
    const needsOctaveShift = shape.some((fret, stringIndex) => fret + change[stringIndex] < 0);
    return shape.map((fret, stringIndex) => fret + (needsOctaveShift ? 12 : 0) + change[stringIndex]);
  });
}

function getRecommendedFingers(quality, shapeIndex, frets) {
  const lowPositionFingerings = {
    "major-1-2,1,0,2": [2, 1, 0, 3],
    "major-2-2,0,1,2": [2, 0, 1, 3],
    "minor-1-2,0,0,2": [2, 0, 0, 3],
    "minor-2-1,0,1,1": [1, 0, 2, 3],
  };
  const override = lowPositionFingerings[`${quality}-${shapeIndex}-${frets.join(",")}`];
  if (override) return override;
  return recommendedFingerings[quality][shapeIndex].map((finger, stringIndex) =>
    frets[stringIndex] === 0 ? 0 : finger,
  );
}

function svgElement(tagName, attributes = {}) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tagName);
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
  return element;
}

function createFretDiagram(shapeName, chordName, quality, frets, fingers) {
  const diagram = svgElement("svg", {
    class: "fret-diagram",
    viewBox: "0 0 150 180",
    role: "img",
    "aria-label": `${chordName} ${quality}, ${shapeName}. Frets ${frets.join(", ")} on strings 4 through 1. Recommended fingers ${fingers.map((finger) => finger || "open").join(", ")}.`,
  });
  const hasOpenString = frets.includes(0);
  const positiveFrets = frets.filter((fret) => fret > 0);
  const baseFret = hasOpenString ? 1 : Math.min(...positiveFrets);
  const stringXPositions = [30, 60, 90, 120];
  const top = 30;
  const fretHeight = 30;

  for (let row = 0; row <= 4; row += 1) {
    diagram.appendChild(
      svgElement("line", {
        class: row === 0 && hasOpenString ? "nut" : "fret",
        x1: 30,
        y1: top + row * fretHeight,
        x2: 120,
        y2: top + row * fretHeight,
      }),
    );
  }

  stringXPositions.forEach((x, stringIndex) => {
    diagram.appendChild(svgElement("line", { class: "string", x1: x, y1: top, x2: x, y2: 150 }));

    const stringLabel = svgElement("text", { x, y: 174 });
    stringLabel.textContent = String(4 - stringIndex);
    diagram.appendChild(stringLabel);

    const fret = frets[stringIndex];
    const marker = svgElement("circle", {
      class: fret === 0 ? "open-marker" : "marker",
      cx: x,
      cy: fret === 0 ? 16 : top + (fret - baseFret + 0.5) * fretHeight,
      r: 9,
    });
    diagram.appendChild(marker);

    const fingerLabel = svgElement("text", {
      class: `marker-label${fret === 0 ? " open-label" : ""}`,
      x,
      y: fret === 0 ? 16 : top + (fret - baseFret + 0.5) * fretHeight,
      dy: "0.35em",
    });
    fingerLabel.textContent = fret === 0 ? "O" : String(fingers[stringIndex]);
    diagram.appendChild(fingerLabel);
  });

  const positionLabel = svgElement("text", { class: "position-label", x: 23, y: 49 });
  positionLabel.textContent = hasOpenString ? "nut" : `${baseFret}fr`;
  diagram.appendChild(positionLabel);
  return diagram;
}

function renderBanjoShapes(key, keyIndex, degreeIndex) {
  const quality = chordQuality(degreeIndex);
  const chordName = key.chords[degreeIndex];
  const chordRootPitchClass = modulo(rootPitchClasses[keyIndex] + majorScaleIntervals[degreeIndex], 12);
  const fretSets = getChordShapeFrets(chordRootPitchClass, quality);
  banjoChordName.textContent = `${chordName} ${quality}`;
  banjoShapes.replaceChildren(
    ...banjoShapeDefinitions.map((definition, shapeIndex) => {
      const frets = fretSets[shapeIndex];
      const fingers = getRecommendedFingers(quality, shapeIndex, frets);
      const card = document.createElement("article");
      const copy = document.createElement("div");
      const heading = document.createElement("h4");
      const inversion = document.createElement("p");
      const fretData = document.createElement("dl");
      const fretLabel = document.createElement("dt");
      const fretValues = document.createElement("dd");

      card.className = "banjo-shape";
      copy.className = "shape-copy";
      fretData.className = "shape-frets";
      heading.textContent = definition.name;
      inversion.textContent = `${definition.inversion} · ${voicingDegrees[quality][shapeIndex]}`;
      fretLabel.textContent = "Frets · strings 4 → 1";
      fretValues.textContent = frets.join(" · ");
      fretData.append(fretLabel, fretValues);
      copy.append(heading, inversion, fretData);
      card.append(copy, createFretDiagram(definition.name, chordName, quality, frets, fingers));
      return card;
    }),
  );
}

function activateChordTab(key, keyIndex, degreeIndex, moveFocus = false) {
  const tabs = [...chordTabs.querySelectorAll('[role="tab"]')];
  tabs.forEach((tab, tabIndex) => {
    const isActive = tabIndex === degreeIndex;
    tab.setAttribute("aria-selected", String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
  });
  chordPanel.setAttribute("aria-labelledby", tabs[degreeIndex].id);
  renderBanjoShapes(key, keyIndex, degreeIndex);
  if (moveFocus) tabs[degreeIndex].focus();
}

function renderChordTabs(key, keyIndex) {
  banjoKeyName.textContent = `${key.major} major`;
  chordTabs.replaceChildren(
    ...key.chords.map((chord, degreeIndex) => {
      const tab = document.createElement("button");
      const numeral = document.createElement("b");
      const chordName = document.createElement("span");
      tab.type = "button";
      tab.id = `chord-tab-${keyIndex}-${degreeIndex}`;
      tab.className = "chord-tab";
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", "chord-panel");
      tab.dataset.degree = String(degreeIndex);
      numeral.textContent = degrees[degreeIndex];
      chordName.textContent = chord;
      tab.append(numeral, chordName);
      return tab;
    }),
  );
  activateChordTab(key, keyIndex, 0);
}

function buildChart() {
  const namespace = "http://www.w3.org/2000/svg";

  keys.forEach((key, index) => {
    const start = index * sliceAngle - sliceAngle / 2;
    const end = start + sliceAngle;
    const angle = index * sliceAngle;
    const group = document.createElementNS(namespace, "g");
    group.classList.add("segment");
    group.dataset.index = index;
    group.setAttribute("role", "button");
    group.setAttribute("tabindex", "0");
    group.setAttribute("aria-label", `${key.major} major, relative ${key.minor} minor, ${key.signature}`);

    const majorWedge = document.createElementNS(namespace, "path");
    majorWedge.classList.add("major-wedge");
    majorWedge.setAttribute("d", ringPath(middleRadius, outerRadius, start, end));

    const minorWedge = document.createElementNS(namespace, "path");
    minorWedge.classList.add("minor-wedge");
    minorWedge.setAttribute("d", ringPath(innerRadius, middleRadius, start, end));

    const majorLabel = document.createElementNS(namespace, "text");
    majorLabel.classList.add("key-label");
    const labelRotation = readableLabelRotation(angle);
    majorLabel.setAttribute("transform", `translate(${labelPoint(252, angle)}) rotate(${labelRotation})`);
    majorLabel.textContent = key.major;
    if (key.major.length > 4) majorLabel.setAttribute("font-size", "23");

    const minorLabel = document.createElementNS(namespace, "text");
    minorLabel.classList.add("minor-label");
    minorLabel.setAttribute("transform", `translate(${labelPoint(151, angle)}) rotate(${labelRotation})`);
    minorLabel.textContent = `${key.minor}m`;
    if (key.minor.length > 4) minorLabel.setAttribute("font-size", "12");

    const accidentalLabel = document.createElementNS(namespace, "text");
    accidentalLabel.classList.add("accidental-label");
    accidentalLabel.setAttribute("transform", `translate(${labelPoint(286, angle)}) rotate(${labelRotation})`);
    accidentalLabel.textContent = index === 0 ? "NATURAL" : index <= 6 ? `${index} ♯` : `${12 - index} ♭`;

    group.append(majorWedge, minorWedge, majorLabel, minorLabel, accidentalLabel);
    wheel.appendChild(group);
  });

  setRotation(-sliceAngle);
  selectKey(1);
}

function selectKey(index) {
  selectedIndex = index;
  const key = keys[index];
  const dominantKey = keys[(index + 1) % keys.length];
  const subdominantKey = keys[(index - 1 + keys.length) % keys.length];

  document.querySelectorAll(".segment").forEach((segment, segmentIndex) => {
    segment.classList.toggle("is-selected", segmentIndex === index);
    segment.setAttribute("aria-pressed", segmentIndex === index ? "true" : "false");
  });

  keyName.textContent = key.major;
  minorName.textContent = `${key.minor} minor`;
  signature.textContent = key.signature;
  dominant.textContent = `${dominantKey.major} major`;
  subdominant.textContent = `${subdominantKey.major} major`;
  practiceLink.href = `practice.html?key=${index}`;
  practiceLinkLabel.textContent = `Practice ${key.major} major`;

  degreeList.replaceChildren(
    ...key.chords.map((chord, degreeIndex) => {
      const item = document.createElement("li");
      const numeral = document.createElement("b");
      const chordName = document.createElement("span");
      const quality = degreeIndex === 6 ? "diminished" : [1, 2, 5].includes(degreeIndex) ? "minor" : "major";

      item.className = `degree${chord.length > 7 ? " is-long" : ""}`;
      item.setAttribute("aria-label", `Degree ${degrees[degreeIndex]}: ${chord}, ${quality}`);
      numeral.textContent = degrees[degreeIndex];
      chordName.textContent = chord;
      item.append(numeral, chordName);
      return item;
    }),
  );

  renderPentatonicScales(key, index);
  renderChordTabs(key, index);
}

function normalizeRotation(value) {
  return ((value % 360) + 360) % 360;
}

function setRotation(value) {
  rotation = value;
  wheel.style.transform = `rotate(${rotation}deg)`;
}

function rotateBy(amount) {
  setRotation(Math.round(rotation / sliceAngle) * sliceAngle + amount);
  selectKey(Math.round(normalizeRotation(-rotation) / sliceAngle) % keys.length);
}

function rotateToKey(index) {
  const baseRotation = -index * sliceAngle;
  const nearestRevolution = Math.round((rotation - baseRotation) / 360);
  setRotation(baseRotation + nearestRevolution * 360);
  selectKey(index);
}

function pointerAngle(event) {
  const rect = svg.getBoundingClientRect();
  const x = event.clientX - (rect.left + rect.width / 2);
  const y = event.clientY - (rect.top + rect.height / 2);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

svg.addEventListener("pointerdown", (event) => {
  isDragging = true;
  dragDistance = 0;
  previousPointerAngle = pointerAngle(event);
  svg.setPointerCapture(event.pointerId);
  svg.classList.add("is-dragging");
});

svg.addEventListener("pointermove", (event) => {
  if (!isDragging) return;
  const nextAngle = pointerAngle(event);
  let delta = nextAngle - previousPointerAngle;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  dragDistance += Math.abs(delta);
  setRotation(rotation + delta);
  previousPointerAngle = nextAngle;
});

function endDrag(event) {
  if (!isDragging) return;
  isDragging = false;
  svg.classList.remove("is-dragging");
  if (svg.hasPointerCapture(event.pointerId)) svg.releasePointerCapture(event.pointerId);
  setRotation(Math.round(rotation / sliceAngle) * sliceAngle);
  selectKey(Math.round(normalizeRotation(-rotation) / sliceAngle) % keys.length);
}

svg.addEventListener("pointerup", endDrag);
svg.addEventListener("pointercancel", endDrag);

wheel.addEventListener("click", (event) => {
  if (dragDistance > 5) return;
  const segment = event.target.closest(".segment");
  if (segment) rotateToKey(Number(segment.dataset.index));
});

wheel.addEventListener("keydown", (event) => {
  const segment = event.target.closest(".segment");
  if (!segment) return;

  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    rotateToKey(Number(segment.dataset.index));
  }
});

chordTabs.addEventListener("click", (event) => {
  const tab = event.target.closest('[role="tab"]');
  if (!tab) return;
  activateChordTab(keys[selectedIndex], selectedIndex, Number(tab.dataset.degree));
});

chordTabs.addEventListener("keydown", (event) => {
  const tab = event.target.closest('[role="tab"]');
  if (!tab || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  event.preventDefault();

  const currentDegree = Number(tab.dataset.degree);
  let nextDegree = currentDegree;
  if (event.key === "ArrowLeft") nextDegree = modulo(currentDegree - 1, degrees.length);
  if (event.key === "ArrowRight") nextDegree = modulo(currentDegree + 1, degrees.length);
  if (event.key === "Home") nextDegree = 0;
  if (event.key === "End") nextDegree = degrees.length - 1;
  activateChordTab(keys[selectedIndex], selectedIndex, nextDegree, true);
});

rotateLeft.addEventListener("click", () => rotateBy(-sliceAngle));
rotateRight.addEventListener("click", () => rotateBy(sliceAngle));

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") rotateBy(-sliceAngle);
  if (event.key === "ArrowRight") rotateBy(sliceAngle);
});

buildChart();
