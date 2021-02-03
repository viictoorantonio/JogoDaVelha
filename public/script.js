//Functions Components
function renderBoard(location, player) {
    let element = document.querySelector(`p[data-requester="${location}-${player}"]`)
    element.style.display = 'block'
    element.parentNode.removeEventListener('click', positionReveled)
}

function menu(open, type) {
    if (open) {
        document.querySelector('#' + type).style.display = 'flex'
    } else {
        document.querySelector('#' + type).style.display = 'none'
    }
}

function win(winner) {
    const typePlayer = localStorage.getItem('typePlayer')

    if (winner == 'velha') {
        alert('DEU VELHA')
    } else if (winner == typePlayer) {
        alert('VOCÊ GANHOU')
    } else {
        alert('VOCÊ PERDEU')
    }

    menu(false, 'filter')
    restart()
}

function restart() {
    for (i = 0; i < 9; i++) {
        document.querySelector(`p[data-requester="${i}-X"]`).style.display = 'none'
        document.querySelector(`p[data-requester="${i}-O"]`).style.display = 'none'
    }

    menu(true, 'promise')
}

//Function Initial
function start() {
    const board = document.querySelectorAll('.col')
    for (b of board) {
        b.addEventListener('click', positionReveled)
    }

    menu(false, 'promise')
    menu(false, 'menuPrincipal')
}

function positionReveled(event, p) {
    const typePlayer = localStorage.getItem('typePlayer')
    renderBoard(event.target.id, typePlayer)
    socket.emit('position', { id: event.target.id, typePlayer: typePlayer })
    menu(true, 'filter')
}

// AQUI ONDE ACONTECE A COMUNICAÇÃO SOCKET.IO
const socket = io('http://192.168.6.161')

socket.on('start', () => {
    start()
})

socket.on('type', data => {

    let countFinal = 0
    let count = 0
    let type

    for (p of data) {
        if (p === socket.id) {
            countFinal = count
        }
        count++
    }

    if (countFinal === 0) {
        type = 'X'
    } else {
        type = 'O'
    }

    document.getElementById('typePlayer').innerHTML = type

    localStorage.setItem('socketId', socket.id)
    localStorage.setItem('typePlayer', type)

    if (type === 'X') {
        menu(false, 'filter')
    } else {
        menu(true, 'filter')
    }
})

socket.on('positions', data => {
    renderBoard(data.id, data.typePlayer)

    if (data.typePlayer === 'X' && localStorage.getItem('typePlayer') === 'O') {
        localStorage.setItem('pemited', true)
        menu(false, 'filter')
    } else if (data.typePlayer === 'O' && localStorage.getItem('typePlayer') === 'X') {
        localStorage.setItem('pemited', true)
        menu(false, 'filter')
    }

    if (data.winner !== null) {
        win(data.winner)
    } else if (data.winner === 'velha') {
        win('velha')
    }
})

socket.on('youWinner', winner => {
    console.log(winner)
    if (winner === 'velha') {
        win('velha')
    } else {
        win(winner)
    }
})

socket.on('restart', () => {
    restart()
})