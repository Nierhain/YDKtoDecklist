const {app, BrowserWindow} = require('electron')
const axios = require('axios')
const fs = require('fs')
var Datastore = require('nedb')
var db = new Datastore({filename: 'cards.db', autoload: true})

// [{'id' : number, 'name': String, 'amount': number}]
var deck = []

function createWindow(){

    if(!fs.existsSync('cards.db')){
        updateCards()
    }

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
    axios.get('https://db.ygoprodeck.com/api/v6/cardinfo.php').then(function (response){
        let cards = []
        response.data.array.forEach(card => {
            cards.push({'id' : card.id, 'name' : card.name})
        });
        db.insert(cards)
    }).catch(function (error){
        console.log(error)
    })
}