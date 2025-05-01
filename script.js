
const playRefBtn = document.getElementById('play-reference');
const playScaleBtn = document.getElementById('play-scale');

function playNote(noteFile) {
  const audio = new Audio(`audio/${encodeURIComponent(noteFile)}.mp3`);
  audio.play();
}

playRefBtn.addEventListener('click', () => playNote('d4'));
playScaleBtn.addEventListener('click', () => playNote('dmajorscale'));
