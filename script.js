const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const noteButtonsContainer = document.getElementById('note-buttons-container');
const promptText = document.getElementById('prompt');
const playRefBtn = document.getElementById('play-reference');
const replayNoteBtn = document.getElementById('replay-note');
const nextBtn = document.getElementById('next-button');
const resetScoreBtn = document.getElementById('reset-score');
const backButton = document.getElementById('back-button');
const displayNotesBtn = document.getElementById('display-notes');
const displayDegreesBtn = document.getElementById('display-degrees');
const scaleLabel = document.getElementById('scale-label');
const octaveLabel = document.getElementById('octave-label');
const correctCount = document.getElementById('correct-count');
const incorrectCount = document.getElementById('incorrect-count');
const totalCount = document.getElementById('total-count');
const accuracyDisplay = document.getElementById('accuracy');
const addNoteBtn = document.getElementById('add-note');
const removeNoteBtn = document.getElementById('remove-note');

const noteMap = {
  'D': ['d4', 'd5'],
  'E': ['e4'],
  'F#': ['f#4'],
  'G': ['g4'],
  'A': ['a4'],
  'B': ['b4'],
  'C#': ['c#5']
};


const degreeMap = {
  'D': '1st',
  'E': '2nd',
  'F#': '3rd',
  'G': '4th',
  'A': '5th',
  'B': '6th',
  'C#': '7th'
};

let currentNote = '';
let audio = new Audio();
let correct = 0;
let incorrect = 0;
let isAnswered = false;
let showDegrees = false;
let currentMode = 8;
let currentNotes = [];

const dMajorNoteOrder = ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'];

function getNoteName(filename) {
  const mapping = {
    'd4': 'D',
    'd5': 'D',
    'e4': 'E',
    'f#4': 'F#',
    'g4': 'G',
    'a4': 'A',
    'b4': 'B',
    'c#5': 'C#'
  };
  return mapping[filename] || '';
}


function playNote(noteFile) {
  audio.src = `audio/${encodeURIComponent(noteFile)}.mp3`;
  audio.play();
}

function updateNoteButtonLabels() {
  const buttons = noteButtonsContainer.querySelectorAll('.blue-button');
  buttons.forEach(btn => {
    const note = btn.getAttribute('data-note');
    btn.textContent = showDegrees ? degreeMap[note] : note;
  });
}

function buildNoteButtons() {
  noteButtonsContainer.innerHTML = '';
  const keys = dMajorNoteOrder.slice(0, currentMode);
  currentNotes = keys.map(key => noteMap[key][0]);

  keys.forEach(note => {
    const btn = document.createElement('button');
    btn.className = 'blue-button';
    btn.setAttribute('data-note', note);
    btn.textContent = showDegrees ? degreeMap[note] : note;
    btn.addEventListener('click', handleAnswer);
    noteButtonsContainer.appendChild(btn);
  });
}

function updateModeButtonsState() {
  addNoteBtn.disabled = currentMode >= 8;
  removeNoteBtn.disabled = currentMode <= 2;
}

function loadNewNote() {
  isAnswered = false;
  buildNoteButtons();
  const buttons = noteButtonsContainer.querySelectorAll('.blue-button');
  buttons.forEach(btn => {
    btn.disabled = false;
    btn.classList.remove('correct', 'incorrect');
  });
  const candidates = [...currentNotes];
  if (currentMode === 8) candidates.push('d5');
  currentNote = candidates[Math.floor(Math.random() * candidates.length)];
  playNote(currentNote);
  promptText.textContent = 'Which note was played?';
  nextBtn.disabled = true;
  updateModeButtonsState();
}

function handleAnswer(e) {
  if (isAnswered) return;
  isAnswered = true;

  const selected = e.target.getAttribute('data-note');
  const correctName = getNoteName(currentNote);

  if (selected === correctName) {
    correct++;
    e.target.classList.add('correct');
    promptText.textContent = showDegrees
      ? `Correct! ✅ The note was the ${degreeMap[correctName]} scale degree`
      : `Correct! ✅ The note was ${correctName}`;
  } else {
    incorrect++;
    e.target.classList.add('incorrect');
    const correctBtn = [...noteButtonsContainer.querySelectorAll('.blue-button')]
      .find(btn => btn.getAttribute('data-note') === correctName);
    if (correctBtn) correctBtn.classList.add('correct');
    promptText.textContent = showDegrees
      ? `Incorrect! ❌ The note was the ${degreeMap[correctName]} scale degree`
      : `Incorrect! ❌ The note played was actually ${correctName}`;
  }

  updateScore();
  nextBtn.disabled = false;
  [...noteButtonsContainer.querySelectorAll('.blue-button')].forEach(btn => btn.disabled = true);
}

function updateScore() {
  const total = correct + incorrect;
  correctCount.textContent = correct;
  incorrectCount.textContent = incorrect;
  totalCount.textContent = total;
  accuracyDisplay.textContent = total ? ((correct / total) * 100).toFixed(1) + '%' : '0.0%';
}

function resetScore() {
  correct = 0;
  incorrect = 0;
  updateScore();
}

function toggleDisplay(mode) {
  showDegrees = mode === 'degrees';
  updateNoteButtonLabels();
  displayNotesBtn.classList.toggle('selected', !showDegrees);
  displayDegreesBtn.classList.toggle('selected', showDegrees);

  scaleLabel.textContent = showDegrees
    ? 'Diatonic notes of the D Major Scale (Ionian Mode)'
    : 'Diatonic notes of the D Major Scale (Ionian Mode)';

  const noteTextOptions = {
    2: 'Notes C and D from one octave',
    3: 'Notes C, D and E from one octave',
    4: 'Notes C, D, E and F from one octave',
    5: 'Notes C, D, E, F and G from one octave',
    6: 'Notes C, D, E, F, G and A from one octave',
    7: 'Notes C, D, E, F, G, A and B from one octave',
    8: 'One Octave (Notes D4 to D5) - the C button works for D4&D5!'
  };

  octaveLabel.textContent = noteTextOptions[currentMode];
  playRefBtn.textContent = showDegrees ? 'Play Reference, C (Tonic)' : 'Play Reference, C (Tonic)';
  promptText.textContent = 'Which note was played?';
}

document.querySelectorAll('.mode-button').forEach(btn =>
  btn.addEventListener('click', () => {
    currentMode = parseInt(btn.getAttribute('data-mode'), 10);
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    resetScore();
    toggleDisplay('notes');
    loadNewNote();
  })
);

backButton.addEventListener('click', () => {
  gameScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
});

playRefBtn.addEventListener('click', () => playNote('d4'));
replayNoteBtn.addEventListener('click', () => playNote(currentNote));
nextBtn.addEventListener('click', loadNewNote);
resetScoreBtn.addEventListener('click', resetScore);
displayNotesBtn.addEventListener('click', () => toggleDisplay('notes'));
displayDegreesBtn.addEventListener('click', () => toggleDisplay('degrees'));
addNoteBtn.addEventListener('click', () => {
  if (currentMode < 8) {
    currentMode++;
    resetScore();
    toggleDisplay(showDegrees ? 'degrees' : 'notes');
    loadNewNote();
  }
});
removeNoteBtn.addEventListener('click', () => {
  if (currentMode > 2) {
    currentMode--;
    resetScore();
    toggleDisplay(showDegrees ? 'degrees' : 'notes');
    loadNewNote();
  }
});
