//Timmy Nguyen
//Introduction to Web Development
//Project 4: Multiplayer Tic-Tac-Toe 

// SERVER SETUP
const express = require("express");          
const http = require("http");                 
const WebSocket = require("ws");              

const app = express();                        
const server = http.createServer(app);        
const wss = new WebSocket.Server({ server }); 

app.use(express.static("public"));            //public folder

const GAME_PASSWORD = "Pineapple";            

//game state
let gameState = {
    board: Array(9).fill(""),
    currentPlayer: "X",
    winner: null
};

//track the 2 players 
let players = {
    X: null,
    O: null
};

//send gamestate to everyone
function broadcastState() {
    const payload = JSON.stringify({
        type: "state", gameState
    });

    //using lambda expression to loop through clients
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
        }
    });
}

//check for winner
function checkWinner(board) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (const [a, b, c] of lines) {
        if (
            board[a] &&
            board[a] === board[b] &&
            board[a] === board[c]
        ) {
            return board[a];
        }
    }

    return null;
}

// connection event handler websocket
wss.on("connection", ws => {

    //variables of the connection
    ws.playerName = "";
    ws.role = "spectator";
    ws.authenticated = false;

    //current gamestate
    ws.send(JSON.stringify({ type: "state", gameState }));

    //message recieved 
    ws.on("message", message => {

        const data = JSON.parse(message);

        //verify password login
        if (data.type === "login") {

            if (data.password !== GAME_PASSWORD) {
                ws.send(JSON.stringify({ type: "error", message: "Invalid password" }));
                return;
            }

            //save user information when password is verified
            ws.playerName = data.name;
            ws.authenticated = true;

            if (!players.X) {
                players.X = ws;
                ws.role = "X";
            } else if (!players.O) {
                players.O = ws;
                ws.role = "O";
            } else {
                ws.role = "spectator";
            }

            console.log(`role = ${ws.role} for ${ws.playerName}`);

            //inform client of assigned role
            ws.send(
                JSON.stringify({ type: "role", role: ws.role, name: ws.playerName })
            );
            return;
        }

        //authentication
        if (!ws.authenticated) {
            return;
        }

        //place the piece
        if (data.type === "place") {
            const index = data.index;

            console.log(`player ${ws.role} is trying to place a game piece`);

            //X and O
            if (ws.role !== "X" && ws.role !== "O") {
                return;
            }

            //player turn
            if (ws.role !== gameState.currentPlayer) {
                return;
            }

            //game finished
            if (gameState.winner) {
                return;
            }

            //cell alrdy occupied
            if (gameState.board[index] !== "") {
                return;
            }

            //place move
            gameState.board[index] = gameState.currentPlayer;

            const winner = checkWinner(gameState.board);

            if (winner) {
                gameState.winner = winner;
            } else {
                gameState.currentPlayer = gameState.currentPlayer === "X" ? "O" : "X";
            }

            broadcastState();
        }

        //reset
        if (data.type === "reset") {
            gameState = {
                board: Array(9).fill(""),
                currentPlayer: "X",
                winner: null
            };

            broadcastState();
        }
    });

    //client disconnects
    ws.on("close", () => {
        if (players.X === ws) {
            players.X = null;
        }
        if (players.O === ws) {
            players.O = null;
        }
    });

});

//start server
//use the port Render gives us, or 3000 when running on my computer
const PORT = process.env.PORT || 3000;

//"0.0.0.0" lets Render reach the server (not just localhost)
server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});

