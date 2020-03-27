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
let deck = {'main' : {}, 'extra': {}, 'side': {}, 'mainAmount': 0, 'extraAmount': 0, 'sideAmount': 0}

function createWindow(){

    let win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })
    win.setTitle('YDK to Decklist')
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

ipcMain.on('parse-deck', (event, arg) => {
    ydkToDeck(arg)
    event.reply('deck-parsed', deck)
})

function ydkToDeck(ydkPath){
    var data = fs.readFileSync(ydkPath, {encoding : 'utf8'})
    main = data.slice(data.search('#main') + 5, data.search('#extra')).split(/\r\n/i).filter((el) => {return el != ""}).sort()
    extra = data.slice(data.search('#extra') + 6, data.search('!side')).split(/\r\n/i).filter((el) => {return el != ""}).sort()
    side = data.slice(data.search('!side') + 5, data.length).split(/\r\n/i).filter((el) => {return el != ""}).sort()

    parsedMain = parseDeck(main)
    parsedExtra = parseDeck(extra)
    parsedSide = parseDeck(side)

    deck.main = parsedMain.parsed
    deck.extra = parsedExtra.parsed
    deck.side = parsedSide.parsed

    deck.mainAmount = parsedMain.maxAmount
    deck.extraAmount = parsedExtra.maxAmount
    deck.sideAmount = parsedSide.maxAmount

    deck.main.sort(sortByAmount)
    deck.extra.sort(sortByAmount)
    deck.side.sort(sortByAmount)
}

function sortByAmount(a,b){
    return b.amount - a.amount
}

function getCardName(cardID){
    var cardDB = Object.values(store.store)
    var card = cardDB.find(entry => entry.id == cardID)
    return card.name
}

function parseDeck(parsingDeck){
    var parsed = []
    var totalCards = 0
    while(parsingDeck.length){
            var card = calcPerCardAmount(parsingDeck)
            if(foundException = cardExceptions.find((entry => entry.id == card.id))){card.id = foundException.correct_id} //check for known passcode exceptions (e.g. 'foolish burial' in ygopro2 having multiple passcodes)
            card.name = getCardName(card.id)
            parsed.push({'id' : card.id, 'name' : card.name,'amount' : card.amount})
            parsingDeck.splice(0,card.amount)
            totalCards += card.amount
    }
    return { 'parsed' : parsed, 'maxAmount' : totalCards}
}

function calcPerCardAmount(arr){
    cardid = arr[0]
    amount = arr.filter(entry => entry == cardid)
    return {'id': cardid, 'amount': amount.length}
}