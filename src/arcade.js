// --- CORE ARCADE SYSTEM (Vite Escort Update) ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const modal = document.getElementById('arcadeModal');
const titleText = document.getElementById('modalGameTitle');

// SET NEW EXTENDED INTERNAL RESOLUTION (750 Height)
canvas.width = 800;
canvas.height = 750; // Increased height to fit bottom escort craft

let animationFrameId;
let currentGame = null;
let keys = {};
let restartCallback = null;
let isSavingScore = false;

// Global Keyboard Tracking System (Lowercase enforcement)
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});
window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Prevent browser scrolling when playing games
window.addEventListener('keydown', (e) => {
    if(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code) && !modal.classList.contains('hidden')) {
        if(!isSavingScore) e.preventDefault();
    }
});

// Menu Open/Close Cabinet Controls
function openGame(gameType) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    keys = {}; // Clear keys on open
    currentGame = gameType;
    isSavingScore = false;
    
    if (gameType === 'asteroidshooter') {
        titleText.innerText = "Asteroid Shooter - Escort Active";
        if (typeof initAsteroidShooter === 'function') {
            initAsteroidShooter(); 
        } else {
            console.error("Error: initAsteroidShooter function not found! Check asteroid.js");
        }
    } else if (gameType === 'retrojumper') {
        titleText.innerText = "Retro Jumper - Active Cabinet";
        if (typeof initRetroJumper === 'function') {
            initRetroJumper(); 
        } else {
            console.error("Error: initRetroJumper function not found! Check jumper.js");
        }
    }
}

function closeGame() {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    if(animationFrameId) cancelAnimationFrame(animationFrameId);
    currentGame = null;
    restartCallback = null;
    isSavingScore = false;
}

// Global Arcade Leaderboard Storage Logic
function getLeaderboard(gameKey) {
    let data = localStorage.getItem('arcade_leaderboard_' + gameKey);
    if (!data) {
        return [
            { name: "AAA", score: 1000 },
            { name: "IPX", score: 750 },
            { name: "AST", score: 500 },
            { name: "JMP", score: 250 },
            { name: "BOT", score: 100 }
        ];
    }
    return JSON.parse(data);
}

function checkAndSaveScore(gameKey, newScore, callback) {
    let board = getLeaderboard(gameKey);
    if (newScore > board[board.length - 1].score || board.length < 5) {
        isSavingScore = true;
        setTimeout(() => {
            let name = prompt("NEW HIGH SCORE! Enter your 3 Initials:", "AAA");
            if (!name) name = "UNK";
            name = name.toUpperCase().slice(0, 3); 
            board.push({ name: name, score: newScore });
            board.sort((a, b) => b.score - a.score); 
            board = board.slice(0, 5); 
            localStorage.setItem('arcade_leaderboard_' + gameKey, JSON.stringify(board));
            isSavingScore = false;
            if(callback) callback();
        }, 100);
    } else {
        if(callback) callback();
    }
}

function drawLeaderboard(gameKey, x, y) {
    let board = getLeaderboard(gameKey);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px "Space Grotesk"';
    ctx.fillText("TOP 5 HIGH SCORES", x, y);
    ctx.font = '14px monospace';
    board.forEach((entry, idx) => {
        ctx.fillStyle = idx === 0 ? '#ffb03a' : '#8b95a1'; 
        ctx.fillText(`${idx + 1}. ${entry.name} ..... ${entry.score}`, x, y + 25 + (idx * 20));
    });
}