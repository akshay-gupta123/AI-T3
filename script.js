const EMPTY = -1;
const PLAYER = 0;
const OPPONENT = 1;

// DOM
const _board = document.querySelector('.board');
const _cells = Array.from(_board.children);
const _diceRoll = document.querySelector('.dice-roll');
const _scores = document.querySelector('.scores');
const _message = document.querySelector('.message');
const _playBtn = document.querySelector('.top-btn');
const _choiceBtn = document.querySelector('.choice');
const _choices = Array.from(_choiceBtn.children);

let board = emptyBoard();
let winPatterns = [
    0b111000000, 0b000111000, 0b000000111, // rows
    0b100100100, 0b010010010, 0b001001001, // cols
    0b100010001, 0b001010100 // diags
];


class AI {

    constructor(difficulty = 1) {
        this.difficulty = difficulty;
    }

    findBestMove() {
        return this.minimax(this.difficulty, OPPONENT).position;
    }

    minimax(depth, minmaxer) {

        let nextMoves = getAvailableMoves();
        let bestMove = { score: (minmaxer === OPPONENT) ? -10000 : 10000,  position: -1};

        // Collect every available move
        let randomizedMoves = [];

        if (!nextMoves.length || depth === 0) {
            bestMove.score = this.evaluate();
        } else {

            for (let i = 0; i < nextMoves.length; ++i) {

                let moveSimulation = nextMoves[i];
                board[moveSimulation] = minmaxer;

                let score = this.minimax(depth - 1, (minmaxer === OPPONENT) ? PLAYER : OPPONENT).score;

                randomizedMoves.push({score:score, position:moveSimulation});

                if ((minmaxer === OPPONENT && score > bestMove.score) ||
                    (minmaxer === PLAYER && score < bestMove.score)) {
                    bestMove = {score: score, position: moveSimulation };
                }

                board[moveSimulation] = EMPTY;
            }
        }
        
        // Take one random move if several moves with the same score are available. 
        if(randomizedMoves.length){
            
            // First AI move
            if(randomizedMoves.length === board.length){
                bestMove = randomizedMoves[Math.floor(Math.random() * randomizedMoves.length)];
            } else {
                randomizedMoves = randomizedMoves.filter( m => m.score === bestMove.score);
                bestMove = randomizedMoves[Math.floor(Math.random() * randomizedMoves.length)];
            }
        }

        return bestMove;
    }

    // Score Heuristic Evaluation
    evaluate() {

        let score = 0;

        score += this.evaluateLine(0, 1, 2); // row 1
        score += this.evaluateLine(3, 4, 5); // row 2
        score += this.evaluateLine(6, 7, 8); // row 3
        score += this.evaluateLine(0, 3, 6); // col 1
        score += this.evaluateLine(1, 4, 7); // col 2
        score += this.evaluateLine(2, 5, 8); // col 3
        score += this.evaluateLine(0, 4, 8); // diag.
        score += this.evaluateLine(2, 4, 6); // alt. diag.

        return score;
    }

    evaluateLine(a, b, c) {

        let score = 0;
        let cA = board[a];
        let cB = board[b];
        let cC = board[c];

        // first cell
        if (cA == OPPONENT) {
            score = 1;
        } else if (cA == PLAYER) {
            score = -1;
        }

        // second cell
        if (cB == OPPONENT) {
            if (score == 1) {
                score = 10;
            } else if (score == -1) {
                return 0;
            } else {
                score = 1;
            }
        } else if (cB == PLAYER) {
            if (score == -1) {
                score = -10;
            } else if (score == 1) {
                return 0;
            } else {
                score = -1;
            }
        }

        // third cell
        if (cC == OPPONENT) {
            if (score > 0) {
                score *= 10;
            } else if (score < 0) {
                return 0;
            } else {
                score = 1;
            }
        } else if (cC == PLAYER) {
            if (score < 0) {
                score *= 10;
            } else if (score > 1) {
                return 0;
            } else {
                score = -1;
            }
        }

        return score;
    }

}

class HumanPlayer {

    constructor(name) {
        this.name = name;
        this.win = 0;
    }

    play() {
        _message.textContent = `${this.name} turn!` ;

        return new Promise((resolve) => {
            let disposeFn = event(_board, 'click', e => {
                let target = e.target;
                if (target.classList.contains('cell')) { // If we hit a cell
                    let idx = _cells.indexOf(target); // get the cell index.
                    if (getAvailableMoves().indexOf(idx) !== -1) { // must be available
                        disposeFn();
                        resolve(idx);
                    }
                }
            });
        })
    }

}

class AIPlayer {

    constructor(difficulty = 2) {
        this.difficulty = difficulty;
        this.name = `${this.getRandomName()}(AI)`;
        this.win = 0;
    }

    getRandomName() {
        return AIPlayer.names[Math.floor(Math.random() * (AIPlayer.names.length - 1))];
    }

    setBoard() {
        this.ai = new AI(1);
    }

    play() {
        _message.textContent = `${this.name}'s turn`;
        return new Promise((res) => {
            let randomTimer = Math.floor(Math.random() * 1000 + 500);
            let move = this.ai.findBestMove();
            setTimeout(() => res(move), randomTimer);
        })
    }
}

AIPlayer.names = ['Leanne', 'Ervin', 'Clementine', 'Patricia', 'Chelsey', 'Dennis', 'Kurtis',
    'Nicholas', 'Alphonse', 'Marie', 'Edouard', 'Lucille', 'Julie', 'Bernard'
];

let player = null;
let opponent = null;
let startingPlayer = null;
let currentPlayer = null;

/**
 * Game utils
 */
function emptyBoard() {
    return [EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY, EMPTY];
}

function hasAvailableMove() {
    return board.some(cell => cell === EMPTY);
}

function getAvailableMoves() {
    return board.reduce((acc, current, idx) => {
        current === EMPTY && acc.push(idx);
        return acc;
    }, []);
}

function hasWon(player) {

    let pattern = board.reduce((acc, curr, i) => {
        curr === player.symbol && (acc |= (1 << i));
        return acc;
    }, 0b000000000);

    return winPatterns.some(winPattern => {
        return (pattern & winPattern) == winPattern;
    });
}

function getWinner() {
    if (hasWon(player)) return player;
    if (hasWon(opponent)) return opponent;
    return null;
}

function clearBoard() {
    board = emptyBoard();
    _cells.forEach(cell => {
        cell.classList.remove('cross');
        cell.classList.remove('circle');
    });
}

function updateBoard(idx, symbol) {
    board[idx] = symbol;
    _board.children[idx].classList.add(symbol === PLAYER ? 'cross' : 'circle');
}

function isOver() {
    return hasWon(player) || hasWon(opponent) || !hasAvailableMove();
}

function declareTurnWinner() {

    let winner = getWinner();

    if (winner) {

        winner.win++;
        _message.textContent = `${winner.name} win!`;
        _scores.children[winner.symbol].querySelectorAll('li')[winner.win - 1].classList.add('won');

        if (player.win == 3) {
            endState(player);
        } else if (opponent.win == 3) {
            endState(opponent);
        } else {
            nextTurn();
        }

    } else {
        _message.textContent = `Draw!`;
        nextTurn();
    }
}

function nextTurn() {
    _playBtn.textContent = 'Next turn';
    _playBtn.classList.remove('hide');

    let disposeEvent = event(_playBtn, 'click', () => {
        currentPlayer = startingPlayer;
        _playBtn.classList.add('hide');
        clearBoard();
        disposeEvent();
        takeTurn();
    });
}

function getOpponent(which) {
    return which === player ? opponent : player;
}

function takeTurn() {
    return currentPlayer.play()
        .then(move => {
            updateBoard(move, currentPlayer.symbol);
            currentPlayer = getOpponent(currentPlayer);
            return isOver() ? declareTurnWinner() : takeTurn();
        })
}

/**
 * Events handling
 */
let events = [];

function event(target, type, handler) {
    target.addEventListener(type, handler);
    return function disposeEvent() {
        target.removeEventListener(type, handler);
    }
}

function removeEvents() {
    events.forEach(disposeFn => disposeFn());
    events = [];
}

/**
 * Game States
 */
function initState() {

    removeEvents();

    _scores.classList.add('hide');
    _diceRoll.classList.add('hide');
    _playBtn.classList.remove('hide');
    _choiceBtn.classList.add('hide');

    _playBtn.textContent = 'Click to start';
    _message.textContent = 'Tic Tac Toe';

    events.push(event(_playBtn, 'click', playerSetup));
}

function dice() {

    _playBtn.classList.add('hide');
    document.body.classList.remove('playing');

    setTimeout(() => {
        _playBtn.textContent = 'Click to throw the dice';
        _playBtn.classList.remove('hide');
    }, 500);

    let disposeEvent = event(_playBtn, 'click', onDiceRoll);

    function onDiceRoll() {

        _playBtn.classList.add('hide');

        _diceRoll.querySelector('.dice-rolling').textContent = 'The dices are rolling!';

        let scoreA = Math.floor(Math.random() * 5) + 1;
        let scoreB = Math.floor(Math.random() * 5) + 1;  

        while (scoreA === scoreB) {
            scoreA = Math.floor(Math.random() * 5) + 1;
            scoreB = Math.floor(Math.random() * 5) + 1; 
        }

        startingPlayer = scoreA > scoreB ? player : opponent;
        currentPlayer = startingPlayer;

        disposeEvent();

        setTimeout(() => {

            _diceRoll.querySelector('.dice-score').textContent = `${player.name}: ${scoreA} - ${opponent.name}: ${scoreB}.`;
            _diceRoll.querySelector('.dice-result').textContent = `${startingPlayer.name} start!`;

            _playBtn.textContent = 'Start';
            _playBtn.classList.remove('hide');

            events.push(event(_playBtn, 'click', playingState));
        }, 1000);
    }

}

function choice(){
    
    removeEvents();

    _playBtn.textContent = 'Select a Method';
    _choices[0].textContent = 'Against Computer'
    _choices[1].textContent = 'Against Human'
    _playBtn.classList.remove('hide');
    _choiceBtn.classList.remove('hide');
    
    _choices[0].addEventListener('click',()=>{
        _diceRoll.classList.remove('hide');
        _playBtn.classList.add('hide');
        _choiceBtn.classList.add('hide');
        
        player = new HumanPlayer('You');
        player.symbol = PLAYER;

        opponent = new AIPlayer();
        opponent.symbol = OPPONENT;
        opponent.setBoard(board);

        _diceRoll.querySelector('.opponent').textContent = `You are playing against ${opponent.name}`;
   
        dice();
    })
    _choices[1].addEventListener('click',()=>{
        _playBtn.classList.add('hide');
        _choiceBtn.classList.add('hide');
        _diceRoll.classList.remove('hide');

        player = new HumanPlayer('Player1');
        player.symbol = PLAYER;

        opponent = new HumanPlayer('Player2');
        opponent.symbol = OPPONENT;

        _diceRoll.querySelector('.opponent').textContent = `${player.name} is playing against ${opponent.name}`;
   
        dice();
    })
}

function playerSetup() {

    removeEvents();

    _scores.classList.add('hide');
    _message.classList.add('hide');
    _playBtn.classList.add('hide');
    _board.classList.add('hide');
    //
    _diceRoll.querySelector('.dice-rolling').textContent = '';
    _diceRoll.querySelector('.dice-score').textContent = '';
    _diceRoll.querySelector('.dice-result').textContent = '';

    choice();

}

function playingState() {

    removeEvents();
    clearBoard();
    Array.from(_scores.querySelectorAll('li')).forEach(li => li.classList.remove('won'));

    _board.classList.remove('hide');
    _scores.classList.remove('hide');
    _playBtn.classList.add('hide');
    _diceRoll.classList.add('hide');
    _message.classList.remove('hide');

    _scores.children[PLAYER].querySelector('span').textContent = player.name;
    _scores.children[OPPONENT].querySelector('span').textContent = opponent.name;

    document.body.classList.add('playing');

    takeTurn();
}

function endState(winner) {
    removeEvents();

    _message.textContent = `${winner.name} wins the game!`;
    document.body.classList.remove('playing');

    _playBtn.classList.remove('hide');
    _playBtn.textContent = 'Try again!';

    events.push(event(_playBtn, 'click', playerSetup));
}

initState();