// Simple typewriter effect
const phrases = [
  'PhD Candidate at Harvard & MIT (HST MEMP)',
  'Researcher in Digital Pathology',
  'Mahmood Lab, Brigham and Women\'s Hospital'
];
let currentPhrase = 0;
let currentChar = 0;
const typedText = document.getElementById('typed-text');
function type() {
  if (!typedText) return;
  if (currentChar < phrases[currentPhrase].length) {
    typedText.textContent += phrases[currentPhrase].charAt(currentChar);
    currentChar++;
    setTimeout(type, 80);
  } else {
    setTimeout(erase, 2000);
  }
}
function erase() {
  if (currentChar > 0) {
    typedText.textContent = phrases[currentPhrase].substring(0, currentChar - 1);
    currentChar--;
    setTimeout(erase, 50);
  } else {
    currentPhrase = (currentPhrase + 1) % phrases.length;
    setTimeout(type, 500);
  }
}
setTimeout(type, 500);
