// Name: Timmy Nguyen
// Introduction to Web Development
// Project 4: Multiplayer Tic-Tac-Toe

//dom elements
const boardCanvas = document.getElementById("board");
const ctx = boardCanvas.getContext("2d");
const statusElement = document.getElementById("status");
const roleElement = document.getElementById("role");
const resetBtn = document.getElementById("resetBtn");
const joinBtn = document.getElementById("joinBtn");
const nameInput = document.getElementById("nameInput");
const passwordInput = document.getElementById("passwordInput");

const CELL_SIZE = 200;

//use secure wss: on Render (https), and normal ws: on localhost (http)
const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const ws = new WebSocket(`${protocol}//${window.location.host}`); // WEBSOCKET CONNECTION

let gameState = null;   //current game state
let role = "spectator"; //player role

//event listener to place a game piece on the board
boardCanvas.addEventListener("click", event => {
    if (role !== "X" && role !== "O") {
        return;
    }

    const rect = boardCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const col = Math.floor(x / 200);
    const row = Math.floor(y / 200);

    const index = row * 3 + col;
    ws.send(JSON.stringify({ type: "place", index }));
}); // End of board click listener

//draw background and grid lines
function drawGrid() {
    ctx.fillStyle = "#4dc9f6";
    ctx.fillRect(0, 0, 600, 600);

    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(200, 0);  ctx.lineTo(200, 600); //verticle line
    ctx.moveTo(400, 0);  ctx.lineTo(400, 600);
    ctx.moveTo(0, 200);  ctx.lineTo(600, 200); //horizontal line
    ctx.moveTo(0, 400);  ctx.lineTo(600, 400);
    ctx.stroke();
}

//draw x in cell 
function drawX(x, y) {
    ctx.beginPath();
    ctx.moveTo(x + 30, y + 30);
    ctx.lineTo(x + 170, y + 170);
    ctx.moveTo(x + 170, y + 30);
    ctx.lineTo(x + 30, y + 170);
    ctx.stroke();
}

//draw o in cell
function drawO(x, y) {
    ctx.beginPath();
    ctx.arc(x + 100, y + 100, 70, 0, 2 * Math.PI);
    ctx.stroke();
}

//redraw board from gamestate
function drawBoard() {
    ctx.clearRect(0, 0, 600, 600);
    drawGrid();

    //draw pieces
    gameState.board.forEach((value, index) => {
        const row = Math.floor(index / 3);
        const col = index % 3;
        const x = col * CELL_SIZE;
        const y = row * CELL_SIZE;

        if (value === "X") {
            drawX(x, y);
        } else if (value === "O") {
            drawO(x, y);
        }
    });

    if (gameState.winner === "Tie") {
        statusElement.textContent = "Tie!";
    } else if (gameState.winner) {
        //find the username of the winner (use the letter if no name)
        let winnerName = gameState.winner === "X" ? gameState.xName : gameState.oName;
        if (!winnerName) {
            winnerName = gameState.winner;
        }
        statusElement.textContent = `${winnerName} (${gameState.winner}) wins!`;
    } else {
        statusElement.textContent = `Turn: ${gameState.currentPlayer}`;
    }
}

// recieve server mesg websocket
ws.onmessage = event => {
    const data = JSON.parse(event.data);

    //updated game state
    if (data.type === "state") {
        gameState = data.gameState;
        drawBoard();
    }

    //role assignment
    if (data.type === "role") {
        role = data.role;
        roleElement.textContent = `Logged in as ${data.name} (${role})`;
    }

    //error message
    if (data.type === "error") {
        alert(data.message);
    }
};

//join game eventlistener
joinBtn.addEventListener("click", () => {
    ws.send(JSON.stringify({
        type: "login",
        name: nameInput.value.trim(),
        password: passwordInput.value
    }));
});

//reset game event listener
resetBtn.addEventListener("click", () => {
    ws.send(JSON.stringify({ type: "reset" }));
});
