// ---------- DOM элементы ----------
const boardElement = document.getElementById('board');
const statusDiv = document.getElementById('statusMessage');
const resetBtn = document.getElementById('resetBtn');
const modeBtns = document.querySelectorAll('.mode-btn');

// ---------- Игровые переменные ----------
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';      // X всегда ходит первым
let gameActive = true;
let currentMode = '2p';       // '2p' или 'ai'
let aiTimeout = null;

// Все выигрышные комбинации (индексы клеток)
const winPatterns = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
];

// ---------- Вспомогательные функции ----------
function createBoardUI() {
    boardElement.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.textContent = board[i];
        cell.addEventListener('click', () => onCellClick(i));
        boardElement.appendChild(cell);
    }
}

function updateBoardUI() {
    const cells = document.querySelectorAll('.cell');
    for (let i = 0; i < 9; i++) {
        cells[i].textContent = board[i];
    }
}

// Проверка победителя или ничьей
function checkGameStatus() {
    for (let pattern of winPatterns) {
        const [a,b,c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];   // 'X' или 'O'
        }
    }
    if (board.every(cell => cell !== '')) return 'tie';
    return null;
}

function updateStatusMessage(winner = null) {
    if (winner === 'X') {
        statusDiv.textContent = '❌ Победили КРЕСТИКИ! ❌';
    } else if (winner === 'O') {
        statusDiv.textContent = '⭕ Победили НОЛИКИ! ⭕';
    } else if (winner === 'tie') {
        statusDiv.textContent = '🤝 НИЧЬЯ! 🤝';
    } else {
        statusDiv.textContent = currentPlayer === 'X' ? 'Ход: ❌' : 'Ход: ⭕';
    }
}

// Завершение игры (если есть победитель или ничья)
function evaluateAndEndGame() {
    const winner = checkGameStatus();
    if (winner) {
        gameActive = false;
        updateStatusMessage(winner);
        return true;
    }
    updateStatusMessage();
    return false;
}

// Совершить ход
function makeMove(index, player) {
    if (!gameActive) return false;
    if (board[index] !== '') return false;
    if (player !== currentPlayer) return false;

    board[index] = player;
    updateBoardUI();

    const ended = evaluateAndEndGame();
    if (ended) return true;

    // Смена игрока
    currentPlayer = (currentPlayer === 'X') ? 'O' : 'X';
    evaluateAndEndGame();  // обновить сообщение после смены

    // Если игра активна и включен режим AI, и теперь ход O — вызываем ИИ
    if (gameActive && currentMode === 'ai' && currentPlayer === 'O') {
        if (aiTimeout) clearTimeout(aiTimeout);
        aiTimeout = setTimeout(() => aiMove(), 200);
    }
    return true;
}

// Ход ИИ: случайная свободная клетка
function aiMove() {
    if (!gameActive) return;
    if (currentMode !== 'ai') return;
    if (currentPlayer !== 'O') return;

    const emptyIndices = board.reduce((acc, cell, idx) => {
        if (cell === '') acc.push(idx);
        return acc;
    }, []);

    if (emptyIndices.length === 0) return;

    const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    makeMove(randomIndex, 'O');
}

// Обработка клика по клетке
function onCellClick(index) {
    if (!gameActive) return;

    // В режиме ИИ, если сейчас ход O — человек не может ходить
    if (currentMode === 'ai' && currentPlayer === 'O') {
        statusDiv.textContent = '🤖 ИИ думает... подожди';
        return;
    }
    if (board[index] !== '') return;

    makeMove(index, currentPlayer);
}

// Сброс игры (очистка поля, X начинает)
function resetGame() {
    if (aiTimeout) clearTimeout(aiTimeout);
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    updateBoardUI();
    evaluateAndEndGame();   // обновит статус на "Ход: X"
}

// Переключение режима (2 игрока / против ИИ)
function setMode(mode) {
    currentMode = mode;
    // Обновить активную кнопку
    modeBtns.forEach(btn => {
        const btnMode = btn.getAttribute('data-mode');
        if (btnMode === mode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    resetGame();
}

// ---------- Инициализация и слушатели ----------
function init() {
    createBoardUI();
    resetGame();

    // Слушатели для кнопок режима
    modeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = btn.getAttribute('data-mode');
            if (mode === '2p') setMode('2p');
            else if (mode === 'ai') setMode('ai');
        });
    });

    resetBtn.addEventListener('click', resetGame);
}

// Запуск
init();
