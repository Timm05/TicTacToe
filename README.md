# Two Player Tic-Tac-Toe — Timmy Nguyen
Introduction to Web Development - Lab 4

## Play the game
Link: https://YOUR-APP-NAME.onrender.com

Game password: Pineapple

## Run it on computer locally
1. `npm install`
2. `npm start`
3. Open http://localhost:3000

## Render Changes
1. **server.js** — the server now uses `process.env.PORT || 3000` and listens on `"0.0.0.0"`.
   Render picks the port for us, so we can't hardcode 3000. `0.0.0.0` lets Render's
   network reach the server instead of only allowing connections from localhost.
2. **client.js** — the WebSocket picks `wss:` when the page is `https:` and `ws:` otherwise.
   Render serves the site over HTTPS, and browsers block a plain `ws://` connection from
   an HTTPS page (mixed content). Locally the page is HTTP, so `ws://` still works.
