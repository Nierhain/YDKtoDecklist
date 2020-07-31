const {app, BrowserWindow, ipcMain} = require('electron')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const Store = require('electron-store')

const store = new Store()

let win


// [{'id' : number, 'name': String, 'amount': number}]
let deck = {'main' : {}, 'extra': {}, 'side': {}, 'mainAmount': 0, 'extraAmount': 0, 'sideAmount': 0}

function createWindow(){
    updateCards()

    win = new BrowserWindow({
        backgroundColor: '#121212',
        frame: true,
        width: 1280,
        height: 720,
        title: 'YDK to Decklist',
        webPreferences: {
            nodeIntegration: true
        },
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
            cards.push({'id' : card.id.toString(), 'name' : card.name, 'type' : card.type, 'prices' : card.card_prices})
        })
        store.set(cards)
    }).catch((error) => {
        console.log(error)
    })
}

ipcMain.on('close-app', () => {
    app.quit()
})

ipcMain.on('minimize-app', () => {
    win.minimize()
})

ipcMain.on('maximize-app', (event, arg) => {
    if(win.isMaximized()){
        win.restore()
    } else {
        win.maximize()
    }
    event.reply('window-maximize', win.isMaximized())
})


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

function getCardInfo(cardID){
    var cardDB = Object.values(store.store)
    var card = cardDB.find(entry => entry.id == cardID)
    return card
}

function parseDeck(parsingDeck){
    var parsed = []
    var totalCards = 0
    while(parsingDeck.length){
            var currentID = parsingDeck[0]
            var amount = calcPerCardAmount(parsingDeck)
            var card = getCardInfo(currentID)
            parsed.push({'id' : card.id, 'name' : card.name, 'amount' : amount, 'type' : card.type, 'prices': card.prices[0]})
            parsingDeck.splice(0, amount)
            totalCards += amount
    }
    return { 'parsed' : parsed, 'maxAmount' : totalCards}
}

function calcPerCardAmount(arr){
    cardid = arr[0]
    amount = arr.filter(entry => entry == cardid)
    return amount.length
}