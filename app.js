const hostSquares = [];
const guestSquares = [];
const width = 10;

document.addEventListener('DOMContentLoaded', () => {
    const hostGrid = document.querySelector('.grid-host');
    const guestGrid = document.querySelector('.grid-guest');
    const shipsContainer = document.querySelector('.ships-container');
    const ships = document.querySelectorAll('.ship')
    const destroyer = document.querySelector('.destroyer-container');
    const submarine = document.querySelector('.submarine-container');
    const cruiser = document.querySelector('.cruiser-container');
    const battleship = document.querySelector('.battleship-container');
    const carrier = document.querySelector('.carrier-container');

    const startButton = document.querySelector('#start');
    const randomizeButton = document.querySelector('#randomize');
    const turnsDisplay = document.querySelector('#whose-go');
    const infoDisplay = document.querySelector('#info');

    renderBoard(hostGrid, hostSquares, width);
    renderBoard(guestGrid, guestSquares, width);

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
    shipsArray.forEach(ship => generate(directions, ship, guestSquares));

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

    startButton.addEventListener('click', e => {
        guestGrid.addEventListener('click', e => revealSquare(e.target, game, turnsDisplay));
        playGame(game, turnsDisplay);
    })

    randomizeButton.addEventListener('click', e => {
        shipsArray.forEach(ship => generate(directions, ship, hostSquares));
        [...shipsContainer.childNodes].forEach(node => node.remove());
    });
})

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
    let droppedShipLastId = draggedShipLastIndex - draggedShipIndex + receivingSquare;

    let isHorizontal = target.ship.classList.length<=2;

    if(isHorizontal){
        console.log('it is horizontal');
        if( Math.floor(droppedShipLastId/10) === Math.floor(receivingSquare/10) ){
            console.log('it fits on the same line');
            for(let i = 0; i < target.shipLength; i++){
                squares[receivingSquare - draggedShipIndex + i].classList.add('taken', draggedShipClass, 'ship')
            }
            container.removeChild(target.ship);
        }else{
            // show some kind of warning...
        }
    }else{
        debugger;
        if( receivingSquare + (target.shipLength * 10) < 100 ){
            for(let i = 0; i < target.shipLength; i++){
                squares[receivingSquare - draggedShipIndex + (10 * i)].classList.add('taken', draggedShipClass, 'ship')
            }
            container.removeChild(target.ship);
        }else{
            //show some kind of warning...
        }
    }
}

function revealSquare(square, game, turnsDisplay){
    if( !square.classList.contains('revealed') )
    {
        if (square.classList.contains('taken')){
            game.score[game.currentPlayer][square.classList[0]] -= 1;
            game.score[game.currentPlayer].total += 1;
            square.classList.add('revealed','hit')
        }else {
            square.classList.add('revealed', 'miss')
        }
        game.currentPlayer = game.currentPlayer === 'host' ? 'guest' : 'host';
        if(game.score[game.currentPlayer].total === 17)
            gameOver();
        else
            playGame(game, turnsDisplay);
    }
}

function playGame(game, turnsDisplay){
    if(game.currentPlayer === 'host'){
        turnsDisplay.textContent = 'Your Go';
    }else if(game.currentPlayer === 'guest'){
        turnsDisplay.textContent = 'Opponent Go';
        setTimeout (() => {
            let random = Math.floor(Math.random() * hostSquares.length);
            revealSquare(hostSquares[random], game, turnsDisplay);
        }, 1000)
    }else
        return;
}

function gameOver(){
    window.alert("Game Over");
}