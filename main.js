const {app, BrowserWindow, ipcMain} = require('electron')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const Store = require('electron-store')

const store = new Store()
const cardExceptions = [
    { 'id' : 81439174, 'correct_id' : 81439173}
]


// [{'id' : number, 'name': String, 'amount': number}]
let deck = {'main' : {}, 'extra': {}, 'side': {}}

function createWindow(){

    let win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })

    win.loadFile('index.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin'){
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0){
        createWindow()
    }
})

function updateCards(){
    axios.get('https://db.ygoprodeck.com/api/v6/cardinfo.php').then((response) => {
        let cards = []
        response.data.forEach(card => {
            cards.push({'id' : card.id.toString(), 'name' : card.name})
        })
        store.set(cards)
    }).catch((error) => {
        console.log(error)
    })
}

ipcMain.on('update-db', (event, arg) => {
    updateCards()
    event.reply('db-updated', true)
})

ipcMain.on('ydk', () => {
    ydkToDeck(path.join(app.getAppPath(), 'ydkTest.ydk'))
})

function ydkToDeck(ydkPath){
    fs.readFile(ydkPath, {encoding : 'utf8'} ,(err, data) => {
        main = data.slice(data.search('#main') + 5, data.search('#extra')).split(/\r\n/i).filter((el) => {return el != ""}).sort()
        extra = data.slice(data.search('#extra') + 6, data.search('!side')).split(/\r\n/i).filter((el) => {return el != ""}).sort()
        side = data.slice(data.search('!side') + 5, data.length).split(/\r\n/i).filter((el) => {return el != ""}).sort()

        deck.main = parseDeck(main)
        console.log('Main parsed')
        deck.extra = parseDeck(extra)
        console.log('Extra parsed')
        deck.side = parseDeck(side)

        deck.main.forEach(card => {
            card.name = getCardName(card.id)
        })
        deck.extra.forEach(card => {
            card.name = getCardName(card.id)
        })
        deck.side.forEach(card => {
            card.name = getCardName(card.id)
        })
        console.log(deck)
    })
}

function getCardName(cardid){
    var cardDB = Object.values(store.store)
    var card = cardDB.find(entry => entry.id == cardid)
    return card.name
}

function parseDeck(parsingDeck){
    var parsed = []
    while(parsingDeck.length){
            var card = calcCardAmount(parsingDeck)
            parsed.push({'id' : card.id, 'name' : ' ','amount' : card.amount})
            parsingDeck.splice(0,card.amount)
    }
    return parsed
}

function calcCardAmount(arr){
    cardid = arr[0]
    amount = arr.filter(entry => entry == cardid)
    if(foundException = cardExceptions.find((entry => entry.id == cardid))){cardid = foundException.correct_id}
    return {'id': cardid, 'amount': amount.length}
}