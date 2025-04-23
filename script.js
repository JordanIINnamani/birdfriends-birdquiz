const YT_API_KEY = 'AIzaSyDzueu9cpoe4SZ7PtI9i9Aqkwo8BPlbDAM';
let currentQuestion = {};
let score = 0;
let audio = new Audio();

async function fetchBirdData() {
  try {
    const response = await fetch('https://xeno-canto.org/api/2/recordings?query=q:A');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.recordings.slice(0, 6);
  } catch (error) {
    console.error('Error fetching bird data:', error);
    document.getElementById('quizError').style.display = 'block';
    document.getElementById('quizError').textContent = 
      `Error loading bird sounds: ${error.message}`;
    return [];
  }
}

async function loadQuestion() {
  try {
    document.getElementById('quizLoader').style.display = 'block';
    document.getElementById('quizContent').style.display = 'none';
    document.getElementById('quizError').style.display = 'none';

    const birds = await fetchBirdData();
    if (birds.length === 0) return;

    const correctBird = birds[Math.floor(Math.random() * birds.length)];
    const options = birds
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(b => b.en)
      .concat(correctBird.en)
      .sort(() => 0.5 - Math.random());

    currentQuestion = {
      question: "Which bird makes this sound?",
      answer: correctBird.en || 'Unknown Bird',
      options: options,
      sound: correctBird.file
    };

    document.getElementById('question').textContent = currentQuestion.question;
    const select = document.getElementById('choices');
    select.innerHTML = `<option value="">Choose an answer...</option>`;
    currentQuestion.options.forEach(option => {
      const opt = document.createElement('option');
      opt.value = option;
      opt.textContent = option || 'Unknown Bird';
      select.appendChild(opt);
    });

    audio.src = currentQuestion.sound;
    document.getElementById('quizLoader').style.display = 'none';
    document.getElementById('quizContent').style.display = 'block';
  } catch (error) {
    document.getElementById('quizError').style.display = 'block';
    document.getElementById('quizError').textContent = 
      `Error loading question: ${error.message}`;
  }
}

document.getElementById('checkAnswer').addEventListener('click', () => {
  const selected = document.getElementById('choices').value;
  const feedback = document.getElementById('quizFeedback');

  if (!selected) {
    feedback.innerHTML = `<div class="alert alert-warning">
      <i class="fas fa-exclamation-triangle me-2"></i>Please pick an answer!
    </div>`;
    return;
  }

  if (selected === currentQuestion.answer) {
    score += 10;
    document.getElementById('score').textContent = score;
    feedback.innerHTML = `<div class="alert alert-success">
      <i class="fas fa-check-circle me-2"></i>🎉 Correct! It's a ${currentQuestion.answer}.
    </div>`;
  } else {
    feedback.innerHTML = `<div class="alert alert-danger">
      <i class="fas fa-times-circle me-2"></i>❌ Try again! The answer was ${currentQuestion.answer}.
    </div>`;
  }
});

document.getElementById('newQuestion').addEventListener('click', loadQuestion);
document.getElementById('playSound').addEventListener('click', () => {
  audio.play();
});

document.addEventListener('DOMContentLoaded', loadQuestion);
