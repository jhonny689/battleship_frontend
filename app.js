document.addEventListener('DOMContentLoaded', () => {
    const hostGrid = document.querySelector('.grid-host');
    const guestGrid = document.querySelector('.grid-guest');
    const shipsContainer = document.querySelector('.ships-grid');
    const ships = document.querySelectorAll('.ship')
    const destroyer = document.querySelector('.destroyer-container');
    const submarine = document.querySelector('.submarine-container');
    const cruiser = document.querySelector('.cruiser-container');
    const battleship = document.querySelector('.battleship-container');
    const carrier = document.querySelector('.carrier-container');

    const startButton = document.querySelector('#start');
    const rotateButton = document.querySelector('#rotate');
    const turnsDisplay = document.querySelector('#whose-go');
    const infoDisplay = document.querySelector('#info');

    const hostSquares = [];
    const guestSquares = [];
    const width = 10;

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

    generate(directions, shipsArray[0], guestSquares);
    generate(directions, shipsArray[1], guestSquares);
    generate(directions, shipsArray[2], guestSquares);
    generate(directions, shipsArray[3], guestSquares);
    generate(directions, shipsArray[4], guestSquares);

})

// This function, renders the boards for the game,
// it takes in parameters the grid for which we want to create squares for,
// the squares array to keep record of the different squares created,
// and the width of the boards, so we know how many suqare to create.
function renderBoard(grid, squares, width) {
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


    const isTaken = current.some(index => squares[randomStart +index].classList.contains('taken'));
    const isAtRightEdge = current.some(index => (randomStart + index) % 10 === 9)
    const isAtLeftEdge = current.some(index => (randomStart + index) % 10 === 0)

    if(!isTaken && !isAtRightEdge && isAtLeftEdge) current.forEach(index => squares[randomStart + index].classList.add('taken',ship.name,'ship'))
    else generate(dir, ship, squares)
}