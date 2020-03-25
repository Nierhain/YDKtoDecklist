const {app, BrowserWindow, ipcMain} = require('electron')
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

        db.count({}, function(err, count){
            if( count < response.data.length){
                let cards = []
                db.remove({}, {multi: true}, function( err, numRemoved) {})
        
                response.data.forEach(card => {
                    cards.push({'id' : card.id, 'name' : card.name})
                });
                console.log(cards)
                db.insert(cards)   
            }
        })
    }).catch(function (error){
        console.log(error)
    })
}

ipcMain.on('update-db', (event, arg) => {
    updateCards()
    event.reply('db-updated', true)
})