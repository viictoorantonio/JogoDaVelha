const express = require('express')
const path = require('path')

const cors = require('cors')

const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'public'))

app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')

app.use('/', (req, res) => {
    res.render('index.html')
})

app.use(cors())

//Primerio é X, segundo é O
let players = []

//Jogadas
let positionsType = []
let positionWin = ['012', '345', '678', '036', '147', '258', '048', '246']
let turn

io.on('connection', socket => {
    
    console.log(`Socket conectado: ${socket.id}`)

    //Juntar o novo jogador aos players
    if(players.length < 2){
        players.push(socket.id)
        socket.emit('type', players)
    }

    //Quando chegar a 2 jogadores avisar que a partida vai iniciar
    if(players.length === 2){
        socket.emit('start', players)
        socket.broadcast.emit('start')

        console.log('A PARTIDA VAI COMEÇAR!!')
    }

    socket.on('disconnect', () => {

        let count = 0

        for(p of players){
            if(p === socket.id){
                if(count != 0){
                    players.splice(count)
                } else {
                    players.splice(0, 1)
                }
                console.log('Jogador desconectado: ' + socket.id)
            }
            count++
        }

        positionsType = []
        socket.broadcast.emit('restart')
        socket.broadcast.emit('type', players)
    })

    socket.on('position', data => {
        positionsType.push(`${data.id}-${data.typePlayer}`)

        let winner = calculingPostion()

        if(winner.winX === true){
            winner = 'X'
        } else if(winner.winO) {
            winner = 'O'
        } else if(positionsType.length === 9) {
            winner = 'velha'
        } else {
            winner = null
        }

        if(winner === data.typePlayer || winner === 'velha'){
            socket.emit('youWinner', winner)
        }

        data.winner = winner
        socket.broadcast.emit('positions', data)
    })
})

function calculingPostion(){
    let winX = false
    let winO = false

    for(i=0; positionsType.length > i; i++){
        for(j=0; positionsType.length > j; j++){
            for(c=0; positionsType.length > c; c++){

                let result = positionsType[i][0] + positionsType[j][0] + positionsType[c][0]

                for(p of positionWin){
                    if(positionsType[i][2] == 'X' && positionsType[j][2] == 'X' && positionsType[c][2] == 'X'){
                        if(result == p){
                            console.log('Combinação encontrada para o player X: ' + result + ' - ' + p)
                            winX = true
                        }
                    } else if(positionsType[i][2] == 'O' && positionsType[j][2] == 'O' && positionsType[c][2] == 'O') {
                        if(result == p){
                            console.log('Combinação encontrada para o player O: ' + result + ' - ' + p)
                            winO = true
                        }
                    }
                }

            }
        }
    }

    return { winX: winX, winO: winO }
}

server.listen(80)