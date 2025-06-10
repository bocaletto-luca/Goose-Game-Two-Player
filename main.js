 "use strict";
    /* Costanti e chiavi */
    const TOTAL_SQUARES = 30;
    const FINAL_SQUARE = TOTAL_SQUARES - 1;
    const OCA_STATE_KEY = "ocaState";
    const OCA_RECORDS_KEY = "ocaRecords";
    
    /* Stato del gioco */
    let positions = { red: 0, blue: 0 }; // Entrambe le pedine partono dalla casella 0
    let currentPlayer = "red";           // "red" = Giocatore 1, "blue" = Giocatore 2
    let gameOver = false;
    
    /* Array di colori pastello per le caselle (evitando rosso e blu) */
    const squareColors = ["#FFF3E0", "#E8F5E9", "#F3E5F5", "#FFFDE7"];
    
    /* Elementi DOM */
    const boardEl = document.getElementById("ocaBoard");
    const messageEl = document.getElementById("ocaMessage");
    const rollButton = document.getElementById("ocaRollButton");
    const helpButton = document.getElementById("ocaHelpButton");
    const recordButton = document.getElementById("ocaRecordButton");
    const downloadButton = document.getElementById("ocaDownloadButton");
    const closeButton = document.getElementById("ocaCloseButton");
    
    /* Associa gli event listener */
    rollButton.addEventListener("click", rollDiceAndPlay);
    helpButton.addEventListener("click", showHelp);
    recordButton.addEventListener("click", showRecord);
    downloadButton.addEventListener("click", downloadRecords);
    closeButton.addEventListener("click", function(){
      if(confirm("Vuoi abbandonare questa sfida?")) {
        window.parent.closeGame();
      }
    });
    
    /* Salva lo stato nel localStorage */
    function saveOcaState() {
      const state = { positions, currentPlayer, gameOver };
      localStorage.setItem(OCA_STATE_KEY, JSON.stringify(state));
    }
    
    /* Carica lo stato salvato; se la partita era terminata, ripristina i valori di default */
    function loadOcaState() {
      const saved = localStorage.getItem(OCA_STATE_KEY);
      if (saved) {
        try {
          const state = JSON.parse(saved);
          if (state.gameOver) {  // partita già finita: inizia nuova
            positions = { red: 0, blue: 0 };
            currentPlayer = "red";
            gameOver = false;
            localStorage.removeItem(OCA_STATE_KEY);
          } else {
            positions = state.positions;
            currentPlayer = state.currentPlayer;
            gameOver = state.gameOver;
          }
        } catch (e) {
          console.error("Errore nel caricamento dello stato:", e);
          positions = { red: 0, blue: 0 };
          currentPlayer = "red";
          gameOver = false;
        }
      }
    }
    
    /* Disegna la board e le caselle con colori alternati, ed i token se presenti */
    function updateBoard() {
      boardEl.innerHTML = "";
      for (let i = 0; i < TOTAL_SQUARES; i++) {
        const square = document.createElement("div");
        square.classList.add("square");
        // Assegna colore alternato (se non finale)
        if (i !== FINAL_SQUARE) {
          square.style.backgroundColor = squareColors[i % squareColors.length];
        }
        square.innerText = i;
        if (i === FINAL_SQUARE) {
          square.classList.add("final");
        }
        // Se una pedina è in questa casella, aggiunge il token con lettera e emoji.
        if (positions.red === i || positions.blue === i) {
          const token = document.createElement("div");
          token.classList.add("token");
          if (positions.red === i && positions.blue === i) {
            token.innerText = "R🏍️ & B🚗";
          } else if (positions.red === i) {
            token.innerText = "R🏍️";
            token.classList.add("red");
          } else if (positions.blue === i) {
            token.innerText = "B🚗";
            token.classList.add("blue");
          }
          square.appendChild(token);
        }
        boardEl.appendChild(square);
      }
    }
    
    /* Aggiorna il messaggio in alto */
    function updateMessage(text) {
      messageEl.innerText = text;
    }
    
    /* Tira il dado: valore intero da 1 a 6 */
    function rollDice() {
      return Math.floor(Math.random() * 6) + 1;
    }
    
    /* Gestisce il turno: tira il dado, sposta il token e controlla il win */
    function rollDiceAndPlay() {
      if (gameOver) return;
      const dice = rollDice();
      updateMessage(`Hai tirato: ${dice}`);
      setTimeout(() => { playTurn(dice); }, 1000);
    }
    
    /* Esegue il turno: se (posizione corrente + volta) >= FINAL_SQUARE, vinci (senza bounce) */
    function playTurn(dice) {
      let tentative = positions[currentPlayer] + dice;
      if (tentative >= FINAL_SQUARE) {
        // Se supera o arriva esattamente, vinci
        positions[currentPlayer] = FINAL_SQUARE;
        updateBoard();
        gameOver = true;
        updateMessage(`Ha vinto ${currentPlayer === "red" ? "Giocatore 1 (Rosso)" : "Giocatore 2 (Blu)"}! 🎉`);
        saveOcaRecord(currentPlayer);
        saveOcaState();
        setTimeout(() => {
          window.parent.reportGameResult(currentPlayer === "red" ? "red" : "blue");
          localStorage.removeItem(OCA_STATE_KEY);
        }, 1000);
        return;
      } else {
        // Altrimenti muovi senza bouncing (per facilitare la conclusione)
        positions[currentPlayer] = tentative;
      }
      updateBoard();
      // Alterna turno
      currentPlayer = currentPlayer === "red" ? "blue" : "red";
      updateMessage(`Turno: ${currentPlayer === "red" ? "Giocatore 1 (Rosso)" : "Giocatore 2 (Blu)"}`);
      saveOcaState();
    }
    
    /* Funzioni per i record */
    function getOcaRecords() {
      return JSON.parse(localStorage.getItem(OCA_RECORDS_KEY)) || [];
    }
    function saveOcaRecord(winner) {
      const record = {
        date: new Date().toLocaleString(),
        players: "Giocatore 1 (Rosso) vs Giocatore 2 (Blu)",
        winner: winner === "red" ? "Giocatore 1 (Rosso)" : "Giocatore 2 (Blu)"
      };
      let records = getOcaRecords();
      records.push(record);
      localStorage.setItem(OCA_RECORDS_KEY, JSON.stringify(records));
    }
    function showRecord() {
      let records = getOcaRecords();
      let text = "Record Gioco dell'Oca:\n\n";
      if(records.length === 0) text += "Nessun record salvato.";
      else {
        records.forEach((rec, i) => {
          text += `${i+1}. ${rec.date} - Vincitore: ${rec.winner}\n`;
        });
      }
      alert(text);
    }
    function downloadRecords() {
      let records = getOcaRecords();
      let data = JSON.stringify(records, null, 2);
      let blob = new Blob([data], { type: "application/json" });
      let url = URL.createObjectURL(blob);
      let a = document.createElement("a");
      a.href = url;
      a.download = "oca-records.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
    
    /* Inizializza il gioco: carica lo stato oppure usa i valori di default,
       quindi disegna subito la board con le pedine in posizione iniziale. */
    function initOcaGame() {
      loadOcaState();
      updateBoard();
      updateMessage(`Turno: Giocatore 1 (Rosso)`);
    }
    
    // Avvio immediato: mostra la board con le pedine in casella 0.
    initOcaGame();
