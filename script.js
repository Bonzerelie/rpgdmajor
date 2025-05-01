const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const noteButtonsContainer = document.getElementById('note-buttons-container');
const promptText = document.getElementById('prompt');
const playRefBtn = document.getElementById('play-reference');
const playScaleBtn = document.getElementById('play-scale');
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
  'D': ['d3', 'd4'],
  'E': ['e3'],
  'F#': ['f#3'],
  'G': ['g3'],
  'A': ['a3'],
  'B': ['b3'],
  'C#': ['c#4']
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

const dMajorNoteOrder = ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'];

let currentNote = '';
let audio = new Audio();
let correct = 0;
let incorrect = 0;
let isAnswered = false;
let showDegrees = false;
let currentMode = 8;
let currentNotes = [];

function getNoteName(filename) {
  const mapping = {
    'd3': 'D',
    'd4': 'D',
    'e3': 'E',
    'f#3': 'F#',
    'g3': 'G',
    'a3': 'A',
    'b3': 'B',
    'c#4': 'C#'
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
    if (showDegrees) {
      if (currentMode === 8 && note === 'D') {
        btn.textContent = '1st/8th';
        btn.classList.add('wide-label');
      } else {
        btn.textContent = degreeMap[note];
        btn.classList.remove('wide-label');
      }
    } else {
      btn.textContent = note;
      btn.classList.remove('wide-label');
    }
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
    btn.textContent = showDegrees ? (currentMode === 8 && note === 'D' ? '1st/8th' : degreeMap[note]) : note;
    if (currentMode === 8 && note === 'D' && showDegrees) {
      btn.classList.add('wide-label');
    }
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
  if (currentMode === 8) candidates.push('d4');
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
      ? `Correct! ✅ The note was the ${currentMode === 8 && correctName === 'D' ? '1st/8th' : degreeMap[correctName]} scale degree`
      : `Correct! ✅ The note was ${correctName}`;
  } else {
    incorrect++;
    e.target.classList.add('incorrect');
    const correctBtn = [...noteButtonsContainer.querySelectorAll('.blue-button')]
      .find(btn => btn.getAttribute('data-note') === correctName);
    if (correctBtn) correctBtn.classList.add('correct');
    promptText.textContent = showDegrees
      ? `Incorrect! ❌ The note was the ${currentMode === 8 && correctName === 'D' ? '1st/8th' : degreeMap[correctName]} scale degree`
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

  scaleLabel.textContent = 'Diatonic notes of the D Major Scale (Ionian Mode)';

  const noteTextOptions = {
    2: 'Notes D and E from one octave',
    3: 'Notes D, E and F# from one octave',
    4: 'Notes D, E, F# and G from one octave',
    5: 'Notes D, E, F#, G and A from one octave',
    6: 'Notes D, E, F#, G, A and B from one octave',
    7: 'Notes D, E, F#, G, A, B and C# from one octave',
    8: 'One Octave (Notes D3 to D4) - the D button works for D3&D4!'
  };

  octaveLabel.textContent = noteTextOptions[currentMode];
  playRefBtn.textContent = 'Play Reference, D (Tonic)';
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

playRefBtn.addEventListener('click', () => playNote('d3'));
playScaleBtn.addEventListener('click', () => playNote('dmajorscale'));
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
