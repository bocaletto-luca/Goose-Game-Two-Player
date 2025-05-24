"use strict";
// Gioco dell'Oca – Versione Semplificata per 2 Player

const TOTAL_SQUARES = 30;
const FINAL_SQUARE = TOTAL_SQUARES - 1;

let positions = { red: 0, blue: 0 };
let currentPlayer = "red";  // "red" = Giocatore 1 (Rosso), "blue" = Giocatore 2 (Blu)
let gameOver = false;

const boardEl = document.getElementById("board");
const messageEl = document.getElementById("message");
const rollButton = document.getElementById("rollButton");
const closeButton = document.getElementById("closeButton");

closeButton.addEventListener("click", () => {
  if (confirm("Vuoi davvero abbandonare il gioco?")) {
    window.parent.closeGame();
  }
});

rollButton.addEventListener("click", () => {
  if (gameOver) return;
  const dice = rollDice();
  updateMessage(`Hai tirato: ${dice}`);
  setTimeout(() => { playTurn(dice); }, 1000);
});

function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

function playTurn(dice) {
  let newPos = positions[currentPlayer] + dice;
  if (newPos > FINAL_SQUARE) {
    newPos = FINAL_SQUARE - (newPos - FINAL_SQUARE);
  }
  positions[currentPlayer] = newPos;
  renderBoard();
  if (newPos === FINAL_SQUARE) {
    gameOver = true;
    updateMessage(`Ha vinto ${currentPlayer === "red" ? "Giocatore 1 (Rosso)" : "Giocatore 2 (Blu)"}! 🎉`);
    setTimeout(() => {
      window.parent.reportGameResult(currentPlayer === "red" ? "red" : "blue");
    }, 1000);
    return;
  }
  currentPlayer = currentPlayer === "red" ? "blue" : "red";
  updateMessage(`Turno: ${currentPlayer === "red" ? "Giocatore 1 (Rosso)" : "Giocatore 2 (Blu)"}`);
}

function renderBoard() {
  boardEl.innerHTML = "";
  for (let i = 0; i < TOTAL_SQUARES; i++) {
    const square = document.createElement("div");
    square.classList.add("square");
    if (i === FINAL_SQUARE) {
      square.classList.add("final");
      square.innerText = i;
    } else {
      square.innerText = i;
    }
    let tokens = [];
    if (positions.red === i) tokens.push("R");
    if (positions.blue === i) tokens.push("B");
    if (tokens.length > 0) {
      const tokenDiv = document.createElement("div");
      tokenDiv.classList.add("token");
      tokenDiv.innerText = tokens.join(" & ");
      if (positions.red === i && positions.blue !== i) tokenDiv.classList.add("red");
      if (positions.blue === i && positions.red !== i) tokenDiv.classList.add("blue");
      square.appendChild(tokenDiv);
    }
    boardEl.appendChild(square);
  }
}

function updateMessage(text) {
  messageEl.innerText = text;
}

function initGame() {
  positions = { red: 0, blue: 0 };
  currentPlayer = "red";
  gameOver = false;
  updateMessage(`Turno: Giocatore 1 (Rosso)`);
  renderBoard();
}

initGame();
