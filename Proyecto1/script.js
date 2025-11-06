const square = document.getElementById("square");
            const gameArea = document.getElementById("gameArea");
            const scoreDisplay = document.getElementById("score");
            const recordDisplay = document.getElementById("record");
            const messageBox = document.getElementById("messageBox");
            const inventoryButton = document.getElementById("inventoryButton");
            const menuButton = document.getElementById("menuButton");
            const rulesButton = document.getElementById("rulesButton");
            const inventoryPanel = document.getElementById("inventoryPanel");
            const inventoryContent = document.getElementById("inventoryContent");
            const closeInventoryBtn = document.getElementById("closeInventoryBtn");
            const menu = document.getElementById("menu");
            const resetButton = document.getElementById("resetButton");
            const backToGameBtn = document.getElementById("backToGameBtn");
            const shop = document.getElementById("shop");

            let score = 0;
            let record = 0;
            let hasWoodSword = false;
            let startTime;
            let timer;
            let gameActive = true;

            function showMessage(html, color = "white") {
            messageBox.innerHTML = html;
            messageBox.style.color = color;
            messageBox.style.display = "block";
            requestAnimationFrame(() => messageBox.style.opacity = "1");
            clearTimeout(showMessage.timeout);
            showMessage.timeout = setTimeout(() => {
                messageBox.style.opacity = "0";
                setTimeout(() => messageBox.style.display = "none", 500);
            }, 3000);
            }

            function saveProgress() {
            localStorage.setItem("score", score);
            localStorage.setItem("woodSword", hasWoodSword);
            localStorage.setItem("record", record);
            }

            function loadProgress() {
            const savedScore = localStorage.getItem("score");
            const savedSword = localStorage.getItem("woodSword");
            const savedRecord = localStorage.getItem("record");

            if (savedScore) score = parseInt(savedScore);
            if (savedSword === "true") hasWoodSword = true;
            if (savedRecord) record = parseInt(savedRecord);

            updateScore(0);
            updateRecordDisplay();
            updateShop();
            }

            function updateScore(points) {
            score += points;
            scoreDisplay.textContent = `Monedas: ${score}`;
            if (score > record) {
                record = score;
                updateRecordDisplay();
                showMessage("🏆 ¡Nuevo récord!", "gold");
            }
            saveProgress();
            updateShop();
            }

            function updateRecordDisplay() {
            recordDisplay.textContent = `Récord: ${record}`;
            }

            function showSquare() {
            if (!gameActive) return;

            // Mostrarlo temporalmente para medir su tamaño real
            square.style.visibility = "hidden";
            square.style.display = "block";

            const squareWidth = square.offsetWidth;
            const squareHeight = square.offsetHeight;

            const maxX = gameArea.clientWidth - squareWidth;
            const maxY = gameArea.clientHeight - squareHeight;

            const x = Math.random() * maxX;
            const y = Math.random() * maxY;

            // Posicionar y mostrar
            square.style.left = `${x}px`;
            square.style.top = `${y}px`;
            square.style.visibility = "visible";

            startTime = Date.now();

            clearTimeout(timer);
            timer = setTimeout(() => {
                square.style.display = "none";
                showSquare();
            }, 1500);
            }

            square.addEventListener("pointerdown", () => {
            if (!gameActive) return;
            const reaction = Date.now() - startTime;
            clearTimeout(timer);
            square.style.display = "none";

            let points = 0;
            if (reaction <= 600) points = 3;
            else if (reaction <= 1000) points = 2;
            else if (reaction <= 1500) points = 1;
            else points = -1; // pequeña penalización

            if (hasWoodSword) points += 1;
            updateScore(points);
            showMessage(`${points >= 0 ? "+" : ""}${points} monedas`, points >= 0 ? (hasWoodSword ? "cyan" : "lime") : "red");
            showSquare();
            });

            function updateShop() {
            shop.innerHTML = "";
            const sword = document.createElement("div");
            if (!hasWoodSword) {
                sword.textContent = "Espada de madera - Precio: 20 monedas";
                const buyBtn = document.createElement("button");
                buyBtn.textContent = "Comprar";
                buyBtn.style.marginLeft = "10px";
                buyBtn.onclick = () => {
                if (score >= 20) {
                    score -= 20;
                    hasWoodSword = true;
                    updateScore(0);
                    showMessage("¡Has comprado la espada de madera!", "cyan");
                } else showMessage("No tienes suficientes monedas.", "red");
                };
                sword.appendChild(buyBtn);
            } else {
                sword.textContent = "✅ Espada de madera (Activa: +1 moneda por toque)";
                sword.style.color = "cyan";
            }
            shop.appendChild(sword);
            }

            // Inventario
            function toggleInventory() {
            if (inventoryPanel.style.display === "block") {
                inventoryPanel.style.display = "none";
                resumeGame();
            } else {
                pauseGame();
                updateInventory();
                inventoryPanel.style.display = "block";
            }
            }

            function updateInventory() {
            inventoryContent.innerHTML = hasWoodSword
                ? "Espada de madera (Activa: +1 moneda por toque)"
                : "Inventario vacío";
            }

            closeInventoryBtn.onclick = toggleInventory;
            inventoryButton.onclick = toggleInventory;

            // Menú
            resetButton.onclick = () => {
            score = 0;
            hasWoodSword = false;
            localStorage.removeItem("score");
            localStorage.removeItem("woodSword");
            updateScore(0);
            updateRecordDisplay();
            showMessage("Progreso reiniciado (el récord se mantiene)", "orange");
            };

            backToGameBtn.onclick = () => {
            menu.style.display = "none";
            resumeGame();
            };

            menuButton.onclick = () => {
            pauseGame();
            menu.style.display = "flex";
            };

            rulesButton.onclick = () => {
            showMessage(`
                <strong>Reglas:</strong><br><br>
                • < 0.6s → +3 monedas<br>
                • 0.6–1s → +2 monedas<br>
                • 1–1.5s → +1 moneda<br>
                • > 1.5s → -1 moneda<br><br>
                Usa tus monedas para comprar objetos en la tienda.<br>
                El récord se guarda incluso al reiniciar.
            `);
            };

            function pauseGame() {
            gameActive = false;
            clearTimeout(timer);
            square.style.display = "none";
            }

            function resumeGame() {
            gameActive = true;
            showSquare();
            }

            document.addEventListener("keydown", (e) => {
            const key = e.key.toLowerCase();
            if (key === "i") toggleInventory();
            if (key === "m") menuButton.click();
            });

            loadProgress();
            showSquare();