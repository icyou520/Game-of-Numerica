document.addEventListener('DOMContentLoaded', () => {
    const drawTileButton = document.getElementById('drawTile');
    const drawnTileDisplay = document.getElementById('userTiles');
    const tileCountDisplay = document.getElementById('tileCount');
    const columns = Array.from(document.querySelectorAll('.column'));
    const stacks = Array.from(document.querySelectorAll('.stack'));
    const scoreDisplay = document.getElementById('score');
    const timerDisplay = document.getElementById('timer');

    let tileValues = [];
    let currentTile = null;
    let score = 0;
    let startTime = null;
    let timerInterval = null;

    // Initialize tile values (4 of each from 1 to 13)
    for (let i = 1; i <= 13; i++) {
        for (let j = 0; j < 4; j++) {
            tileValues.push(i);
        }
    }

    shuffleArray(tileValues);
    updateTileCount(); // Initial update for the tile count

    drawTileButton.addEventListener('click', drawTile);

    columns.forEach(column => {
        column.addEventListener('dragover', dragOver);
        column.addEventListener('drop', drop);
    });

    stacks.forEach(stack => {
        stack.addEventListener('dragover', dragOver);
        stack.addEventListener('drop', drop);
    });

    function drawTile() {
        if (tileValues.length > 0 && currentTile === null) {
            // Start the timer when the first tile is drawn
            if (!startTime) {
                startGameTimer();
            }

            // Draw the next tile
            const value = tileValues.pop();
            currentTile = document.createElement('div');
            currentTile.classList.add('tile');
            currentTile.textContent = value;
            drawnTileDisplay.innerHTML = '';
            drawnTileDisplay.appendChild(currentTile);

            currentTile.setAttribute('draggable', true);
            currentTile.addEventListener('dragstart', dragStart);
            currentTile.addEventListener('dragend', dragEnd);

            updateTileCount(); // Update the tile count after drawing
        } else if (tileValues.length === 0) {
            drawTileButton.disabled = true; // No more tiles to draw
            alert('No more tiles to draw!');
            stopGameTimer(); // Stop the timer when the game ends
        }
    }

    function dragStart(event) {
        event.dataTransfer.setData('text/plain', event.target.textContent);
        setTimeout(() => {
            event.target.classList.add('dragging');
        }, 0);
    }

    function dragEnd(event) {
        event.target.classList.remove('dragging');
    }

    function dragOver(event) {
        event.preventDefault();
    }

    function drop(event) {
        event.preventDefault();
        const draggedValue = parseInt(event.dataTransfer.getData('text/plain'));
        const draggedTile = document.querySelector('.tile.dragging');
        const targetElement = event.target.closest('.column, .stack');

        if (currentTile) {
            // If a tile is currently being drawn, it can only be placed in a column initially
            if (targetElement && targetElement.classList.contains('column')) {
                placeInColumn(targetElement, draggedTile);
            }
        } else {
            // Tiles can only be moved from columns to stacks
            if (targetElement && targetElement.classList.contains('stack')) {
                const parentColumn = draggedTile.parentElement;
                if (parentColumn && parentColumn.classList.contains('column')) {
                    const isBottomTile = parentColumn.lastElementChild === draggedTile;
                    if (isBottomTile) {
                        placeInStack(targetElement, draggedTile, draggedValue);
                    } else {
                        alert('Only the bottom tile of a column can be moved to a stack.');
                    }
                }
            }
        }
    }

    function placeInColumn(column, tile) {
        tile.style.position = 'relative'; // Remove absolute positioning for column placement
        tile.style.zIndex = '1'; // Reset z-index for tiles in columns
        column.appendChild(tile); // Place the tile at the bottom
        // Do not remove the draggable attribute here, as we want to allow movement to stacks
        resetDrawnTile();
    }

    function placeInStack(stack, tile, value) {
        const lastTile = stack.lastElementChild;
        const lastValue = lastTile ? parseInt(lastTile.textContent) : 0;

        if ((lastValue === 0 && value === 1) || (lastValue > 0 && value === lastValue + 1)) {
            // Insert the new tile at the top by setting its position to cover the previous one
            tile.style.position = 'absolute'; // Ensure absolute positioning for stacking
            stack.appendChild(tile);
            tile.style.zIndex = stack.children.length; // Ensure the latest tile is on top
            updateScore();
            resetDrawnTile();
        } else {
            alert('Cannot place this tile here! Must follow the stack sequence.');
        }
    }

    function resetDrawnTile() {
        drawnTileDisplay.innerHTML = 'Drawn Tile: None'; // Reset the drawn tile display
        currentTile = null;
    }

    function updateScore() {
        score = 0;
        stacks.forEach(stack => {
            const lastTile = stack.lastElementChild;
            if (lastTile) {
                score += parseInt(lastTile.textContent); // Only add the top tile of each stack to the score
            }
        });
        scoreDisplay.textContent = score;
    }

    function updateTileCount() {
        tileCountDisplay.textContent = tileValues.length; // Update the tile count display
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function startGameTimer() {
        startTime = new Date(); // Set the start time
        timerInterval = setInterval(updateTimer, 1000); // Update timer every second
    }

    function updateTimer() {
        const now = new Date();
        const elapsed = now - startTime; // Time elapsed in milliseconds

        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);

        timerDisplay.textContent = `Time Elapsed: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function stopGameTimer() {
        clearInterval(timerInterval); // Stop the timer
    }
});
