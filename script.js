// --- Game State Variables ---
let currentTable = 2; // Starts at 2 as requested
const maxTable = 12;
let maxQuestions = 20;
let currentQuestion = 0;
let score = 0;
let startTime;
let timerInterval;

// DOM Elements
const setupScreen = document.getElementById('game-setup');
const gameArea = document.getElementById('game-area');
const resultsScreen = document.getElementById('results-screen');
const questionText = document.getElementById('question-text');
const answerInput = document.getElementById('answer-input');
const scoreDisplay = document.getElementById('score-display');
const timeDisplay = document.getElementById('time-display');
const feedbackMessage = document.getElementById('feedback-message');
const tableSelect = document.getElementById('table-select');
const rocketImg = document.getElementById('rocket-img'); 

// Audio elements
const correctSound = document.getElementById('correct-sound');
const incorrectSound = document.getElementById('incorrect-sound');

let currentMultiplier;
let currentAnswer;

// --- Setup Functions ---

function populateTableSelect() {
    for (let i = 2; i <= 12; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `The ${i}'s Table`;
        tableSelect.appendChild(option);
    }
    // Set the initial value to 2
    tableSelect.value = currentTable;
}

populateTableSelect(); // Run on load

function startGame() {
    currentTable = parseInt(tableSelect.value);
    maxQuestions = parseInt(document.getElementById('q-count').value);
    
    // Reset state
    currentQuestion = 0;
    score = 0;
    startTime = Date.now();
    
    // Hide setup, show game
    setupScreen.classList.add('hidden');
    resultsScreen.classList.add('hidden');
    gameArea.classList.remove('hidden');

    startTimer();
    nextQuestion();

    // Attach event listener for Enter key
    answerInput.focus();
    answerInput.addEventListener('keyup', handleEnterKey);
}

// --- Game Logic ---

function startTimer() {
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        timeDisplay.textContent = `Time: ${elapsed}s`;
    }, 1000);
}

function updateProgressBar() {
    const percentage = (currentQuestion / maxQuestions) * 100;
    document.getElementById('progress-bar').style.width = `${percentage}%`;
}


function nextQuestion() {
    currentQuestion++;
    
    // Update bar on question load (for Q2, Q3, etc. completion)
    updateProgressBar();
    
    if (currentQuestion > maxQuestions) {
        endGame();
        return;
    }

    // Clear input and feedback
    answerInput.value = '';
    feedbackMessage.textContent = '';
    feedbackMessage.className = '';
    answerInput.focus();

    // Generate random multiplier (1 to 12)
    currentMultiplier = Math.floor(Math.random() * 12) + 1;
    currentAnswer = currentTable * currentMultiplier;

    // UPDATED: Ensure consistent use of <p> tags for clear two-line display
    questionText.innerHTML = `
        <p>Question ${currentQuestion} of ${maxQuestions}:</p>
        <p>What is ${currentTable} &times; ${currentMultiplier}?</p>
    `;

    scoreDisplay.textContent = `Score: ${score}/${currentQuestion - 1}`;
}

function checkAnswer() {
    const userAnswer = parseInt(answerInput.value);

    // Basic validation
    if (isNaN(userAnswer)) {
        feedbackMessage.textContent = "Please enter a number!";
        return;
    }

    // Check if correct
    if (userAnswer === currentAnswer) {
        score++;
        feedbackMessage.textContent = "🌟 Correct! Awesome work!";
        feedbackMessage.classList.add('correct');
        playCorrectSound();
    } else {
        feedbackMessage.textContent = `❌ Incorrect. The answer is ${currentAnswer}.`;
        feedbackMessage.classList.add('incorrect');
        playIncorrectSound();
    }

    // Update score display immediately for the correct/incorrect count
    scoreDisplay.textContent = `Score: ${score}/${currentQuestion}`;

    // Wait a moment before loading the next question
    setTimeout(nextQuestion, 1500); 
}

function handleEnterKey(event) {
    if (event.key === 'Enter') {
        checkAnswer();
    }
}

function endGame() {
    clearInterval(timerInterval);
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    const percentage = (score / maxQuestions) * 100;
    
    // Remove the Enter key listener
    answerInput.removeEventListener('keyup', handleEnterKey);

    // Hide game area, show results
    gameArea.classList.add('hidden');
    resultsScreen.classList.remove('hidden');
    
    // Ensure bar is 100% full when game ends
    updateProgressBar();
    
    // Get Reward Display Element and reset it
    const rewardDisplay = document.getElementById('reward-display');
    rewardDisplay.style.display = 'none';
    rewardDisplay.textContent = '';

    // NEW: Show rocket and trigger animation
    rocketImg.classList.remove('hidden'); // Make rocket visible
    rocketImg.classList.add('blast-off');  // Start animation

    // Check for Reward (90% or higher)
    if (percentage >= 90) {
        rewardDisplay.textContent = "🌟 Mission Master! 🌟";
        rewardDisplay.style.display = 'block';
        // Resetting colors if they were changed by the previous conditional
        rewardDisplay.style.color = '#FFD700'; 
        rewardDisplay.style.borderColor = '#FFD700';
    } else if (percentage >= 70) {
        rewardDisplay.textContent = "Great Effort! Keep Practicing!";
        rewardDisplay.style.display = 'block';
        rewardDisplay.style.color = '#FFA500'; // Orange
        rewardDisplay.style.borderColor = '#FFA500';
    }


    // Display results
    document.getElementById('final-score').textContent = `You scored ${score} out of ${maxQuestions} (${percentage.toFixed(0)}%)!`;
    document.getElementById('final-time').textContent = `Total time: ${totalTime} seconds!`;

    // Logic to automatically advance to the next table
    if (currentTable < maxTable) {
        document.getElementById('results-screen').innerHTML += 
            `<button onclick="autoAdvanceNextTable()">Continue to the ${currentTable + 1}'s Table</button>`;
    }
}

function autoAdvanceNextTable() {
    currentTable++;
    tableSelect.value = currentTable;
    // Remove the "Continue" button dynamically added
    document.getElementById('results-screen').innerHTML = 
        `<h2>Mission Complete! 🎉</h2>
        <div id="rocket-animation-container">
            <img id="rocket-img" src="rocket.png" alt="Rocket" class="hidden">
        </div>
        <div id="reward-display"></div> 
        <p id="final-score"></p>
        <p id="final-time"></p>
        <button onclick="resetGame()">Start New Mission</button>`;
    
    // Start the next table's game
    startGame();
}


function resetGame() {
    resultsScreen.classList.add('hidden');
    setupScreen.classList.remove('hidden');
    // Ensure the table select is set back to the current table
    tableSelect.value = currentTable;

    // RESET ROCKET: Hide it and remove the animation class
    rocketImg.classList.add('hidden');
    rocketImg.classList.remove('blast-off');
    // We rely on the CSS 'bottom: -150px' to reset its start position for the next game
}

// --- Sound Functions ---
function playCorrectSound() {
    correctSound.currentTime = 0; // Rewind to the start
    correctSound.play().catch(e => console.error("Sound playback blocked:", e));
}

function playIncorrectSound() {
    incorrectSound.currentTime = 0; // Rewind to the start
    incorrectSound.play().catch(e => console.error("Sound playback blocked:", e));
}
