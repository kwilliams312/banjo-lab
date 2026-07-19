const { keys, degrees } = window.BANJO_THEORY;

const studyKey = document.querySelector("#study-key");
const flashKey = document.querySelector("#flash-key");
const flashDegree = document.querySelector("#flash-degree");
const flashQuestion = document.querySelector("#flash-question");
const answerForm = document.querySelector("#answer-form");
const chordAnswer = document.querySelector("#chord-answer");
const answerFeedback = document.querySelector("#answer-feedback");
const checkAnswer = document.querySelector("#check-answer");
const revealAnswer = document.querySelector("#reveal-answer");
const nextCard = document.querySelector("#next-card");
const scoreCorrect = document.querySelector("#score-correct");
const scoreAttempts = document.querySelector("#score-attempts");
const scoreStreak = document.querySelector("#score-streak");

let currentKeyIndex = 1;
let currentDegreeIndex = 0;
let previousCardId = "";
let cardResolved = false;
let correctCount = 0;
let attemptCount = 0;
let streakCount = 0;

function renderKeyOptions() {
  const allKeys = document.createElement("option");
  allKeys.value = "all";
  allKeys.textContent = "All keys — mixed review";
  studyKey.appendChild(allKeys);

  keys.forEach((key, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${key.major} major`;
    studyKey.appendChild(option);
  });
  studyKey.value = "1";
}

function normalizeChord(rawAnswer) {
  return rawAnswer
    .toLowerCase()
    .trim()
    .replaceAll("♯", "#")
    .replaceAll("♭", "b")
    .replace(/\bsharp\b/g, "#")
    .replace(/\bflat\b/g, "b")
    .replace(/\bdiminished\b|\bdim\b/g, "°")
    .replace(/\bminor\b/g, "m")
    .replace(/\bmajor\b/g, "")
    .replace(/\s+/g, "");
}

function acceptedAnswers() {
  return keys[currentKeyIndex].chords[currentDegreeIndex].split(" / ").map(normalizeChord);
}

function expectedAnswer() {
  return keys[currentKeyIndex].chords[currentDegreeIndex];
}

function updateScore() {
  scoreCorrect.textContent = String(correctCount);
  scoreAttempts.textContent = String(attemptCount);
  scoreStreak.textContent = String(streakCount);
}

function setResolvedState(resolved) {
  cardResolved = resolved;
  chordAnswer.disabled = resolved;
  checkAnswer.disabled = resolved;
  revealAnswer.disabled = resolved;
}

function randomIndex(length) {
  return Math.floor(Math.random() * length);
}

function chooseCard() {
  const keySetting = studyKey.value;
  let cardId;
  let attempts = 0;

  do {
    currentKeyIndex = keySetting === "all" ? randomIndex(keys.length) : Number(keySetting);
    currentDegreeIndex = randomIndex(degrees.length);
    cardId = `${currentKeyIndex}-${currentDegreeIndex}`;
    attempts += 1;
  } while (cardId === previousCardId && attempts < 20);

  previousCardId = cardId;
}

function renderCard() {
  const key = keys[currentKeyIndex];
  const degree = degrees[currentDegreeIndex];
  flashKey.textContent = `${key.major} major`;
  flashDegree.textContent = degree;
  flashQuestion.textContent = `In ${key.major} major, what is the ${degree} chord?`;
  chordAnswer.value = "";
  chordAnswer.removeAttribute("aria-invalid");
  answerFeedback.textContent = "";
  answerFeedback.className = "answer-feedback";
  setResolvedState(false);
  chordAnswer.focus();
}

function nextFlashCard() {
  chooseCard();
  renderCard();
}

function resolveAnswer(message, resultClass) {
  answerFeedback.textContent = message;
  answerFeedback.className = `answer-feedback ${resultClass}`;
  setResolvedState(true);
  nextCard.focus();
}

answerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (cardResolved) return;

  const answer = normalizeChord(chordAnswer.value);
  if (!answer) {
    chordAnswer.setAttribute("aria-invalid", "true");
    answerFeedback.textContent = "Enter a chord before checking your answer.";
    answerFeedback.className = "answer-feedback is-incorrect";
    chordAnswer.focus();
    return;
  }

  chordAnswer.removeAttribute("aria-invalid");
  attemptCount += 1;
  if (acceptedAnswers().includes(answer)) {
    correctCount += 1;
    streakCount += 1;
    resolveAnswer(`Correct — ${expectedAnswer()} is the ${degrees[currentDegreeIndex]} chord.`, "is-correct");
  } else {
    streakCount = 0;
    chordAnswer.setAttribute("aria-invalid", "true");
    resolveAnswer(`Not quite. The correct chord is ${expectedAnswer()}.`, "is-incorrect");
  }
  updateScore();
});

revealAnswer.addEventListener("click", () => {
  streakCount = 0;
  resolveAnswer(`The answer is ${expectedAnswer()}.`, "is-revealed");
  updateScore();
});

nextCard.addEventListener("click", nextFlashCard);

studyKey.addEventListener("change", () => {
  previousCardId = "";
  nextFlashCard();
});

chordAnswer.addEventListener("input", () => {
  chordAnswer.removeAttribute("aria-invalid");
  if (!cardResolved) {
    answerFeedback.textContent = "";
    answerFeedback.className = "answer-feedback";
  }
});

renderKeyOptions();
nextFlashCard();
updateScore();
