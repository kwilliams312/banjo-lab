const roots = [
  { pitch: 7, name: "G" },
  { pitch: 8, name: "G♯ / A♭" },
  { pitch: 9, name: "A" },
  { pitch: 10, name: "A♯ / B♭" },
  { pitch: 11, name: "B" },
  { pitch: 0, name: "C" },
  { pitch: 1, name: "C♯ / D♭" },
  { pitch: 2, name: "D" },
  { pitch: 3, name: "D♯ / E♭" },
  { pitch: 4, name: "E" },
  { pitch: 5, name: "F" },
  { pitch: 6, name: "F♯ / G♭" },
];

const qualities = [
  { id: "major", suffix: "", label: "major", grid: document.querySelector("#major-grid") },
  { id: "minor", suffix: "m", label: "minor", grid: document.querySelector("#minor-grid") },
  { id: "seventh", suffix: "7", label: "dominant seventh", grid: document.querySelector("#seventh-grid") },
];

function modulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

function majorShapeCandidates(rootPitch) {
  const barre = modulo(rootPitch - 7, 12);
  let fPosition = modulo(rootPitch - 2, 12);
  let dPosition = modulo(rootPitch - 11, 12) + 1;
  if (fPosition < 2) fPosition += 12;
  if (dPosition < 2) dPosition += 12;

  const fFrets = [fPosition, fPosition - 1, fPosition - 2, fPosition];
  const dFrets = [dPosition, dPosition - 2, dPosition - 1, dPosition];
  return [
    { shape: "Barre", frets: [barre, barre, barre, barre], fingers: barre === 0 ? [0, 0, 0, 0] : [1, 1, 1, 1] },
    { shape: "F shape", frets: fFrets, fingers: fFrets.join() === "2,1,0,2" ? [2, 1, 0, 3] : [3, 2, 1, 4] },
    { shape: "D shape", frets: dFrets, fingers: dFrets.join() === "2,0,1,2" ? [2, 0, 1, 3] : [3, 1, 2, 4] },
  ];
}

function minorShapeCandidates(rootPitch) {
  return majorShapeCandidates(rootPitch).map((candidate) => {
    let frets;
    let fingers;
    if (candidate.shape === "Barre") {
      frets = [candidate.frets[0], candidate.frets[1], candidate.frets[2] - 1, candidate.frets[3]];
      if (frets.some((fret) => fret < 0)) frets = frets.map((fret) => fret + 12);
      fingers = [2, 3, 1, 4];
    } else if (candidate.shape === "F shape") {
      frets = [candidate.frets[0], candidate.frets[1] - 1, candidate.frets[2], candidate.frets[3]];
      fingers = frets.join() === "2,0,0,2" ? [2, 0, 0, 3] : [3, 1, 1, 4];
    } else {
      frets = [candidate.frets[0] - 1, candidate.frets[1], candidate.frets[2], candidate.frets[3] - 1];
      fingers = frets.join() === "1,0,1,1" ? [1, 0, 2, 3] : [2, 1, 3, 4];
    }
    return { shape: candidate.shape, frets, fingers };
  });
}

function seventhShapeCandidates(rootPitch) {
  const majorShapes = majorShapeCandidates(rootPitch);
  return majorShapes.map((candidate) => {
    if (candidate.shape === "Barre") {
      const fret = candidate.frets[0];
      if (fret === 0) return { shape: "Barre 7", frets: [0, 0, 0, 3], fingers: [0, 0, 0, 1] };
      if (fret === 1) return { shape: "Barre 7", frets: [1, 1, 1, 4], fingers: [1, 1, 1, 4] };
      return {
        shape: "Barre 7",
        frets: [fret, fret, fret, fret + 3],
        fingers: [1, 1, 1, 4],
      };
    }
    if (candidate.shape === "F shape") {
      const frets = [candidate.frets[0], candidate.frets[1], candidate.frets[2], candidate.frets[3] - 2];
      return { shape: "F-shape 7", frets, fingers: frets.join() === "2,1,0,0" ? [2, 1, 0, 0] : [3, 2, 1, 1] };
    }
    const position = candidate.frets[0];
    return {
      shape: "D-shape 7 (no 5)",
      frets: [position, position + 1, position - 1, position],
      fingers: [2, 4, 1, 3],
    };
  });
}

function bestVoicing(rootPitch, quality) {
  const candidates = quality === "major"
    ? majorShapeCandidates(rootPitch)
    : quality === "minor"
      ? minorShapeCandidates(rootPitch)
      : seventhShapeCandidates(rootPitch);

  const selected = [...candidates].sort((a, b) => {
    const highestA = Math.max(...a.frets);
    const highestB = Math.max(...b.frets);
    return highestA - highestB || Math.min(...a.frets) - Math.min(...b.frets);
  })[0];
  return {
    ...selected,
    fingers: selected.fingers.map((finger, stringIndex) => selected.frets[stringIndex] === 0 ? 0 : finger),
  };
}

function svgElement(tagName, attributes = {}) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tagName);
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
  return element;
}

function createDiagram(chordName, qualityLabel, voicing) {
  const diagram = svgElement("svg", {
    class: "chord-diagram",
    viewBox: "0 0 150 180",
    role: "img",
    "aria-label": `${chordName} ${qualityLabel}, ${voicing.shape}. Frets ${voicing.frets.join(", ")} on strings 4 through 1. Recommended fingers ${voicing.fingers.map((finger) => finger || "open").join(", ")}.`,
  });
  const hasOpenString = voicing.frets.includes(0);
  const positiveFrets = voicing.frets.filter((fret) => fret > 0);
  const baseFret = hasOpenString ? 1 : Math.min(...positiveFrets);
  const stringPositions = [30, 60, 90, 120];
  const top = 30;
  const fretHeight = 30;

  for (let row = 0; row <= 4; row += 1) {
    diagram.appendChild(svgElement("line", {
      class: row === 0 && hasOpenString ? "nut" : "fret",
      x1: 30,
      y1: top + row * fretHeight,
      x2: 120,
      y2: top + row * fretHeight,
    }));
  }

  stringPositions.forEach((x, stringIndex) => {
    diagram.appendChild(svgElement("line", { class: "string", x1: x, y1: top, x2: x, y2: 150 }));
    const stringLabel = svgElement("text", { x, y: 174 });
    stringLabel.textContent = String(4 - stringIndex);
    diagram.appendChild(stringLabel);

    const fret = voicing.frets[stringIndex];
    const marker = svgElement("circle", {
      class: fret === 0 ? "open-marker" : "marker",
      cx: x,
      cy: fret === 0 ? 16 : top + (fret - baseFret + 0.5) * fretHeight,
      r: 9,
    });
    diagram.appendChild(marker);

    const markerLabel = svgElement("text", {
      class: `marker-label${fret === 0 ? " open-label" : ""}`,
      x,
      y: fret === 0 ? 16 : top + (fret - baseFret + 0.5) * fretHeight,
      dy: "0.35em",
    });
    markerLabel.textContent = fret === 0 ? "O" : String(voicing.fingers[stringIndex]);
    diagram.appendChild(markerLabel);
  });

  const positionLabel = svgElement("text", { class: "position-label", x: 23, y: 49 });
  positionLabel.textContent = hasOpenString ? "nut" : `${baseFret}fr`;
  diagram.appendChild(positionLabel);
  return diagram;
}

function createChordCard(root, quality) {
  const voicing = bestVoicing(root.pitch, quality.id);
  const card = document.createElement("article");
  const heading = document.createElement("div");
  const title = document.createElement("h3");
  const meta = document.createElement("dl");
  const shapeRow = document.createElement("div");
  const shapeTerm = document.createElement("dt");
  const shapeValue = document.createElement("dd");
  const fretRow = document.createElement("div");
  const fretTerm = document.createElement("dt");
  const fretValue = document.createElement("dd");

  card.className = "chord-chart-card";
  heading.className = "chord-card-heading";
  meta.className = "chord-card-meta";
  title.textContent = root.name.split(" / ").map((name) => `${name}${quality.suffix}`).join(" / ");
  shapeTerm.textContent = "Shape";
  shapeValue.textContent = voicing.shape;
  fretTerm.textContent = "Frets 4 → 1";
  fretValue.textContent = voicing.frets.join(" · ");
  shapeRow.append(shapeTerm, shapeValue);
  fretRow.append(fretTerm, fretValue);
  meta.append(shapeRow, fretRow);
  heading.appendChild(title);

  if (root.pitch === 7 && quality.id === "major") {
    const badge = document.createElement("span");
    badge.className = "home-badge";
    badge.textContent = "Open G";
    heading.appendChild(badge);
    card.classList.add("is-open-g");
  }

  card.append(heading, createDiagram(title.textContent, quality.label, voicing), meta);
  return card;
}

qualities.forEach((quality) => {
  quality.grid.replaceChildren(...roots.map((root) => createChordCard(root, quality)));
});
