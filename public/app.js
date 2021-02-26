const hostSquares = [];
const guestSquares = [];
const width = 10;

const directions = ["horizontal", "vertical"];

const shipsArray = [
    {
        name: 'destroyer',
        directions: {
            horizontal: [0, 1],
            vertical: [0, width]
        }
    },
    {
        name: 'submarine',
        directions: {
            horizontal: [0, 1, 2],
            vertical: [0, width, width*2]
        }

    },
    {
        name: 'cruiser',
        directions: {
            horizontal: [0, 1, 2],
            vertical: [0, width, width*2]
        }
    },
    {
        name: 'battleship',
        directions: {
            horizontal: [0, 1, 2, 3],
            vertical: [0, width, width*2, width*3]
        }
    },
    {
        name: 'carrier',
        directions: {
            horizontal: [0, 1, 2, 3, 4],
            vertical: [0, width, width*2, width*3, width*4]
        }
    }
]

const game = {
    currentPlayer: "host",
    score: {
        host: {
            destroyer: 2,
            submarine: 3,
            cruiser: 3,
            battleship: 4,
            carrier: 5,
            total: 0
        },
        guest: {
            destroyer: 2,
            submarine: 3,
            cruiser: 3,
            battleship: 4,
            carrier: 5,
            total: 0
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const hostGrid = document.querySelector('.grid-host');
    const guestGrid = document.querySelector('.grid-guest');
    const shipsContainer = document.querySelector('.ships-container');
    const ships = document.querySelectorAll('.ship');

    const singlePlayerBtn = document.querySelector('#singlePlayerButton');
    const multiPlayerBtn = document.querySelector('#multiPlayerButton');

    
    let gameMode = "";
    let playerNum = 0;
    let currentPlayer = "user";
    let ready = false;
    let enemyReady = false;
    let allShipsInPlace = false;
    let shotFired = -1;

    // Select Player Mode
    singlePlayerButton.addEventListener('click', startSinglePlayer);
    multiPlayerButton.addEventListener('click', startMultiPlayer);

    // Multiplayer Function
    function startMultiPlayer(){
        const socket = io();
        console.log("Multi player mode", socket);
        gameMode = 'multiPlayer';

        

        // Get your player number
        socket.on('player-number', num => {
            if(parseInt(num) === -1){
                infoDisplay.innerHTML = "Sorry, the server is full";
            } else {
                playerNum = parseInt(num);
                if(playerNum === 1) currentPlayer = "enemy";
            }
            console.log(playerNum);

            //Get other player status
            socket.emit('check-players');
        });

        // Another player connected/disconnected
        socket.on('player-connection', num => {
            playerConnectedOrDisconnected(num);
            console.log(`Player number ${num} has connected or disconnected`);
        });

        // on enemy ready
        socket.on('enemy-ready', num => {
            enemyReady =true;
            playerReady(num);
            if(ready) playGameMulti(socket);
        })

        //check player status
        socket.on('check-players', players => {
            players.foreach((p, i) => {
                if(p.connected) playerConnectedOrDisconnected(i);
                if(p.ready){
                    playerReady(i);
                    if(i !== playerReady) enemyReady = true;
                }
            })
        })

        // Ready  button click
        startButton.addEventListener('click', () => {
            if(allShipsInPlace) playGameMulti(socket);
            else infoDisplay.innerHTML = "Please place all ships";
        })

        // Setup event listeners for firing
        guestGrid.forEach(square => {
            square.addEventListener('click', () => {
                if(currentPlayer === 'user' && ready && enemyReady){
                    shotFired = square.dataset.id;
                    socket.emit('fire', shotFired);
                }
            })
        })

        function playerConnectedOrDisconnected(num){
            let player = `.p${parseInt(num) + 1}`;
            console.log('in playerConnectedOrDisconnected', parseInt(num) === playerNum, document.querySelector(`${player} .connected span`));
            document.querySelector(`${player} .connected span`).classList.toggle('green');
            if(parseInt(num) === playerNum)
                document.querySelector(player).style.fontWeight = 'bold';
        }
    }

    // Single player Function
    function startSinglePlayer(){
        gameMode = 'singlePlayer';
        shipsArray.forEach(ship => generate(directions, ship, guestSquares));
        startButton.addEventListener('click', e => {
            if(shipsContainer.childElementCount==0){
                guestGrid.addEventListener('click', e => revealSquare(e.target, game, turnsDisplay, guestGrid));
                playGameSingle(game, turnsDisplay, guestGrid);
                // debugger;
                startButton.disabled = true;
            }else{
                //show informative message asking player to place all his ships in Grid
            }
        });
    }

    const startButton = document.querySelector('#start');
    const randomizeButton = document.querySelector('#randomize');
    const turnsDisplay = document.querySelector('#whose-go');
    const resetButton = document.querySelector('#reset');

    renderBoard(hostGrid, hostSquares, width);
    renderBoard(guestGrid, guestSquares, width);


    shipsContainer.addEventListener('click', e => {
        if(e.target.parentElement.matches('div.ship'))
            rotate(e.target.parentElement);
    })

    
    const target = {
        shipNameWithId:'',
        ship:'',
        shipLength: 0
    }
    
    shipsContainer.addEventListener('mousedown', e => {
        grabShip(e, target);
    })
    // console.log('first ship in ships array: ',ships[0]);
    ships.forEach(ship => ship.addEventListener('dragstart', e => {dragStart(e, target)}));
    // hostGrid.addEventListener('dragstart', e => {dragStart(e, shipNameWithId, shipLength)});
    hostGrid.addEventListener('dragover', dragOver);
    hostGrid.addEventListener('dragenter', dragEnter);
    hostGrid.addEventListener('dragleave', dragLeave);
    hostGrid.addEventListener('drop', e => {dragDrop(e, target, hostSquares, shipsContainer)});
    hostGrid.addEventListener('dragend', dragEnd);

    

    randomizeButton.addEventListener('click', e => {
        if(shipsContainer.childElementCount == 5){
            shipsArray.forEach(ship => generate(directions, ship, hostSquares));
            [...shipsContainer.childNodes].forEach(node => node.remove());
        }else {
            reset(e,shipsContainer);
            shipsArray.forEach(ship => generate(directions, ship, hostSquares));
            [...shipsContainer.childNodes].forEach(node => node.remove());
        }
    });

    resetButton.addEventListener('click', e => {
        startButton.disabled = false;
        reset(e, shipsContainer);
    });
})

function reset (e,shipsContainer) {
    //one way to reset the game is to reload the page... but this cannot be reused for the randomize button
    hostSquares.forEach(square => {
        if(square.classList.contains('taken')){
            square.className = '';
        }
    })
    if(shipsContainer){
        shipsContainer.innerHTML = `
            <div class="ship destroyer-container" draggable="true">
                <div id="destroyer-0"></div>
                <div id="destroyer-1"></div>
            </div>
            <div class="ship submarine-container" draggable="true">
                <div id="submarine-0"></div>
                <div id="submarine-1"></div>
                <div id="submarine-2"></div>
            </div>
            <div class="ship cruiser-container" draggable="true">
                <div id="cruiser-0"></div>
                <div id="cruiser-1"></div>
                <div id="cruiser-2"></div>
            </div>
            <div class="ship battleship-container" draggable="true">
                <div id="battleship-0"></div>
                <div id="battleship-1"></div>
                <div id="battleship-2"></div>
                <div id="battleship-3"></div>
            </div>
            <div class="ship carrier-container" draggable="true">
                <div id="carrier-0"></div>
                <div id="carrier-1"></div>
                <div id="carrier-2"></div>
                <div id="carrier-3"></div>
                <div id="carrier-4"></div>
            </div>`
    }
}

// This function, renders the boards for the game,
// it takes in parameters the grid for which we want to create squares for,
// the squares array to keep record of the different squares created,
// and the width of the boards, so we know how many suqare to create.
function renderBoard(grid, squares, width) {
    console.log('inside renderBoard:', grid)
    for(let i = 0; i< width * width; i++){
        const square = document.createElement('div');
        square.dataset.id = i;
        grid.appendChild(square);
        squares.push(square);
    }
}

// This function, places the ships in random positions in the host board in case it is a one-player game.
// so this serves as the computer as guest player.
function generate(dir, ship, squares){
    let randomDirection = dir[Math.floor(Math.random() * dir.length)];
    let current = ship.directions[randomDirection];

    let direction = randomDirection==="horizontal" ? 1 : 10;
    let randomStart = Math.abs(Math.floor(Math.random() * squares.length - (ship.directions["horizontal"].length * direction)));
    // console.log(randomStart)

    const isTaken = current.some(index => squares[randomStart +index].classList.contains('taken'));
    const isAtRightEdge = current.some(index => (randomStart + index) % 10 === 9)
    const isAtLeftEdge = current.some(index => (randomStart + index) % 10 === 0)

    if(!isTaken && !isAtRightEdge && !isAtLeftEdge) current.forEach(index => squares[randomStart + index].classList.add('taken',ship.name,'ship'))
    else generate(dir, ship, squares)
}

function rotate(ship){
    console.log(ship)
    console.log(ship.classList[1])
    ship.classList.toggle(`${ship.classList[1]}-vertical`)
}

function grabShip(e, target){
    // console.log('grabShip e.target: ', e.target);
    target['shipNameWithId'] = e.target.id;
}

function dragStart(e, target){
    // console.log('start e.target: ', e.target);
    target['ship'] = e.target;
    target['shipLength'] = e.target.childElementCount;
}

function dragOver(e){
    e.preventDefault();
}
function dragEnter(e){
    e.preventDefault();
}
function dragLeave(){
    // console.warn('leaving')
}

function dragEnd(){

}

function dragDrop(e, target, squares, container){
    let draggedShipNameWithLastId = target.ship.lastElementChild.id;
    let draggedShipClass = draggedShipNameWithLastId.slice(0, -2);
    let draggedShipLastIndex = parseInt(draggedShipNameWithLastId.substr(-1));
    let draggedShipIndex = parseInt(target.shipNameWithId.substr(-1));
    let receivingSquare = parseInt(e.target.dataset.id);
    let droppedShipFirstId =  receivingSquare - draggedShipIndex;
    let droppedShipLastId = draggedShipLastIndex - draggedShipIndex + receivingSquare;

    let isVertical = [...target.ship.classList].some(className => className.includes('vertical'));

    if(!isVertical){
        // console.log('it is horizontal');
        let current = shipsArray.find(ship => ship.name === draggedShipClass).directions.horizontal;
        let isTaken = current.some(index => squares[droppedShipFirstId +index].classList.contains('taken'));
        if( Math.floor(droppedShipLastId/10) === Math.floor(receivingSquare/10) && !isTaken){
            console.log('it fits on the same line and none of the squares are already taken');
            for(let i = 0; i < target.shipLength; i++){
                squares[receivingSquare - draggedShipIndex + i].classList.add('taken', draggedShipClass, 'ship')
            }
            container.removeChild(target.ship);
        }else{
            // show some kind of warning...
        }
    }else{
        let current = shipsArray.find(ship => ship.name === draggedShipClass).directions.vertical;
        let isTaken = current.some(index => squares[droppedShipFirstId +index].classList.contains('taken'));

        if( receivingSquare + (target.shipLength-1) * 10 < 100 && !isTaken){
            for(let i = 0; i < target.shipLength; i++){
                squares[receivingSquare - draggedShipIndex + (10 * i)].classList.add('taken', draggedShipClass, 'ship')
            }
            container.removeChild(target.ship);
        }else{
            //show some kind of warning...
        }
    }
    if(!container.querySelector('.ship')) allShipsInPlace = true;
}

function revealSquare(square, game, turnsDisplay, guestGrid){
    console.log('guestGrid passed to revealSquare', guestGrid)
    if( !square.classList.contains('revealed') )
    {
        if (square.classList.contains('taken')){
            game.score[game.currentPlayer][square.classList[0]] -= 1;
            game.score[game.currentPlayer].total += 1;
            square.classList.add('revealed','hit')
        }else {
            square.classList.add('revealed', 'miss')
        }
        document.querySelector(`#score #${game.currentPlayer}-score`).textContent = game.score[game.currentPlayer].total;
        game.currentPlayer = game.currentPlayer === 'host' ? 'guest' : 'host';
        if(game.score[game.currentPlayer].total === 17)
            gameOver();
        else
            playGameSingle(game, turnsDisplay, guestGrid);
    }
}
// Game Logic for multi player
function playGameMulti(socket){
    //if game over return
    if(isGameOver) return;

    //if not ready socket.emit('player-ready') and ready = true and playerReady(playerNum)
    if(!ready) {
        socket.emit('player-ready');
        ready = true;
        playerReady(playerNum);
    }

    if(enemyReady){
        if(currentPlayer === 'user'){
            turnsDisplay.innerHTML = 'Your Go';
        }
        if(currentPlayer === 'enemy'){
            turnsDisplay.innerHTML = 'Enemy\'s Go';
        }
    }
}

function playerReady(num){
    let player = `.p${parseInt(num)+1}`;
    document.querySelector(`${player} .ready span`).classList.toggle('green');
}

// Game Logic for single player
function playGameSingle(game, turnsDisplay, guestGrid){
    console.log('guestGrid passed to playGame', guestGrid);
    if(game.currentPlayer === 'host'){
        turnsDisplay.textContent = 'Your Go';
        guestGrid.style.pointerEvents = 'auto';
    }else if(game.currentPlayer === 'guest'){
        // document.querySelector('.grid-guest').style.pointerEvents = 'none';
        guestGrid.style.pointerEvents = 'none';
        turnsDisplay.textContent = 'Opponent Go';
        setTimeout (() => {
            let random = Math.floor(Math.random() * hostSquares.length);
            revealSquare(hostSquares[random], game, turnsDisplay, guestGrid);
        }, 1000)
    }else
        return;
}

function gameOver(){
    window.alert("Game Over");
}