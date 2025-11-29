// Word pools by grade level
const wordPools = {
    prek: [
        'cat', 'dog', 'sun', 'moon', 'star', 'car', 'bus', 'hat', 'cup', 'ball',
        'book', 'tree', 'fish', 'bird', 'cow', 'pig', 'duck', 'bee', 'ant', 'bug',
        'red', 'blue', 'big', 'small', 'up', 'down', 'in', 'out', 'yes', 'no',
        'mom', 'dad', 'baby', 'toy', 'cake', 'milk', 'apple', 'banana', 'bear', 'lion'
    ],
    k: [
        'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
        'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
        'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy',
        'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use', 'run', 'jump',
        'play', 'come', 'make', 'take', 'give', 'live', 'like', 'look', 'find', 'kind'
    ],
    '1st': [
        'after', 'again', 'an', 'any', 'ask', 'as', 'by', 'could', 'every', 'fly',
        'from', 'give', 'going', 'had', 'has', 'her', 'him', 'his', 'how', 'just',
        'know', 'let', 'live', 'may', 'of', 'old', 'once', 'open', 'over', 'put',
        'round', 'some', 'stop', 'take', 'thank', 'them', 'then', 'think', 'walk', 'were',
        'when', 'always', 'around', 'because', 'been', 'before', 'best', 'both', 'buy', 'call'
    ],
    '2nd': [
        'about', 'above', 'across', 'after', 'again', 'against', 'along', 'also', 'always', 'around',
        'because', 'before', 'behind', 'below', 'between', 'both', 'bring', 'carry', 'change', 'clean',
        'close', 'cold', 'come', 'could', 'cut', 'does', 'done', 'draw', 'drink', 'early',
        'eight', 'enough', 'even', 'every', 'fall', 'far', 'fast', 'feel', 'find', 'first',
        'five', 'fly', 'found', 'four', 'full', 'gave', 'give', 'goes', 'goes', 'good',
        'got', 'green', 'grow', 'hand', 'hard', 'has', 'have', 'head', 'hear', 'help'
    ]
};

// Game state
const gameState = {
    bingoCard: [], // 5x5 array of words (or 'FREE' for center)
    markedCells: [], // Array of marked cell positions [row, col]
    currentWord: '', // Currently called word
    activeGrades: ['prek', 'k', '1st', '2nd'], // Default active grades
    gameWon: false
};

// Initialize the game
function initGame() {
    setupEventListeners();
    createBingoCard();
    updateDisplay();
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('callWordBtn').addEventListener('click', callWord);
    document.getElementById('playAgainBtn').addEventListener('click', resetGame);
}

// Get all words from active grade levels
function getAllActiveWords() {
    let allWords = [];
    gameState.activeGrades.forEach(grade => {
        if (wordPools[grade]) {
            allWords = allWords.concat(wordPools[grade]);
        }
    });
    // Remove duplicates
    return [...new Set(allWords)];
}

// Create the bingo card (5x5 grid)
function createBingoCard() {
    const allWords = getAllActiveWords();
    const selectedWords = [];
    
    // Select 24 unique words (25 cells - 1 FREE = 24 words)
    while (selectedWords.length < 24 && allWords.length > 0) {
        const randomIndex = Math.floor(Math.random() * allWords.length);
        const word = allWords.splice(randomIndex, 1)[0];
        selectedWords.push(word);
    }
    
    // Shuffle the selected words
    const shuffledWords = shuffleArray(selectedWords);
    
    // Create 5x5 grid
    gameState.bingoCard = [];
    let wordIndex = 0;
    
    for (let row = 0; row < 5; row++) {
        gameState.bingoCard[row] = [];
        for (let col = 0; col < 5; col++) {
            // Center cell (row 2, col 2) is FREE
            if (row === 2 && col === 2) {
                gameState.bingoCard[row][col] = 'FREE';
            } else {
                gameState.bingoCard[row][col] = shuffledWords[wordIndex];
                wordIndex++;
            }
        }
    }
    
    // Render the card
    renderBingoCard();
}

// Shuffle array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Render the bingo card to the DOM
function renderBingoCard() {
    const bingoCard = document.getElementById('bingoCard');
    bingoCard.innerHTML = '';
    
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            const cell = document.createElement('div');
            cell.className = 'bingo-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            const word = gameState.bingoCard[row][col];
            if (word === 'FREE') {
                cell.textContent = 'FREE';
                cell.classList.add('free-cell');
                cell.classList.add('marked'); // FREE is always marked
                // Mark FREE cell
                if (!isCellMarked(row, col)) {
                    gameState.markedCells.push([row, col]);
                }
            } else {
                cell.textContent = word;
                cell.addEventListener('click', () => handleCellClick(row, col));
            }
            
            bingoCard.appendChild(cell);
        }
    }
    
    // Update marked cells visually
    updateMarkedCells();
}

// Handle cell click
function handleCellClick(row, col) {
    if (gameState.gameWon) return;
    
    const word = gameState.bingoCard[row][col];
    
    // Check if this word matches the current called word
    if (gameState.currentWord && word === gameState.currentWord) {
        // Mark the cell
        if (!isCellMarked(row, col)) {
            gameState.markedCells.push([row, col]);
            updateMarkedCells();
            updateDisplay();
            showFeedback('✅ Correct!', 'correct');
            
            // Check for win
            if (checkWin()) {
                gameState.gameWon = true;
                setTimeout(() => {
                    showWinScreen();
                }, 500);
            }
        } else {
            showFeedback('This word is already marked!', 'warning');
        }
    } else if (gameState.currentWord) {
        showFeedback('❌ That\'s not the right word!', 'incorrect');
    } else {
        showFeedback('Please call a word first!', 'warning');
    }
}

// Check if a cell is marked
function isCellMarked(row, col) {
    return gameState.markedCells.some(([r, c]) => r === row && c === col);
}

// Update visual state of marked cells
function updateMarkedCells() {
    const cells = document.querySelectorAll('.bingo-cell');
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        if (isCellMarked(row, col)) {
            cell.classList.add('marked');
        } else {
            cell.classList.remove('marked');
        }
    });
}

// Call a random word from the bingo card
function callWord() {
    if (gameState.gameWon) return;
    
    // Get all words from the card (excluding FREE and already marked words)
    const availableWords = [];
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
            const word = gameState.bingoCard[row][col];
            if (word !== 'FREE' && !isCellMarked(row, col)) {
                availableWords.push(word);
            }
        }
    }
    
    if (availableWords.length === 0) {
        showFeedback('All words have been called!', 'info');
        return;
    }
    
    // Select a random word from available words
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    gameState.currentWord = availableWords[randomIndex];
    
    // Display the word
    document.getElementById('currentWord').textContent = `"${gameState.currentWord}"`;
    
    // Speak the word using Web Speech API
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(gameState.currentWord);
        utterance.rate = 0.8;
        utterance.pitch = 1.2;
        window.speechSynthesis.speak(utterance);
    }
    
    showFeedback(`Listen: "${gameState.currentWord}"`, 'info');
}

// Check for win condition (5 in a row, column, or diagonal)
function checkWin() {
    // Check rows
    for (let row = 0; row < 5; row++) {
        let markedCount = 0;
        for (let col = 0; col < 5; col++) {
            if (isCellMarked(row, col)) {
                markedCount++;
            }
        }
        if (markedCount === 5) {
            return true; // Row win
        }
    }
    
    // Check columns
    for (let col = 0; col < 5; col++) {
        let markedCount = 0;
        for (let row = 0; row < 5; row++) {
            if (isCellMarked(row, col)) {
                markedCount++;
            }
        }
        if (markedCount === 5) {
            return true; // Column win
        }
    }
    
    // Check main diagonal (top-left to bottom-right)
    let markedCount = 0;
    for (let i = 0; i < 5; i++) {
        if (isCellMarked(i, i)) {
            markedCount++;
        }
    }
    if (markedCount === 5) {
        return true; // Main diagonal win
    }
    
    // Check anti-diagonal (top-right to bottom-left)
    markedCount = 0;
    for (let i = 0; i < 5; i++) {
        if (isCellMarked(i, 4 - i)) {
            markedCount++;
        }
    }
    if (markedCount === 5) {
        return true; // Anti-diagonal win
    }
    
    return false;
}

// Show feedback message
function showFeedback(message, type) {
    const feedbackEl = document.getElementById('feedback');
    feedbackEl.textContent = message;
    feedbackEl.className = `feedback ${type}`;
    
    // Clear feedback after 2 seconds
    setTimeout(() => {
        feedbackEl.className = 'feedback hidden';
    }, 2000);
}

// Update display
function updateDisplay() {
    if (gameState.gameWon) {
        document.getElementById('gameStatus').textContent = 'BINGO!';
    } else {
        const markedCount = gameState.markedCells.length;
        document.getElementById('gameStatus').textContent = `${markedCount} words marked`;
    }
}

// Show win screen
function showWinScreen() {
    document.getElementById('winScreen').style.display = 'block';
    updateDisplay();
}

// Reset game
function resetGame() {
    gameState.markedCells = [];
    gameState.currentWord = '';
    gameState.gameWon = false;
    
    // Clear feedback
    const feedbackEl = document.getElementById('feedback');
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback hidden';
    
    // Reset current word display
    document.getElementById('currentWord').textContent = 'Click "Call Word" to start!';
    
    // Cancel any ongoing speech
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    
    // Hide win screen
    document.getElementById('winScreen').style.display = 'none';
    
    // Create new bingo card
    createBingoCard();
    updateDisplay();
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', initGame);

