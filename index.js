const { ipcRenderer } = require('electron')
const { dialog } = require('electron').remote

let deck = {}
let file


function updateDatabase(){
    ipcRenderer.send('update-db')
}

function parseDeck(){
    if(file){
        ipcRenderer.send('parse-deck', file)
    } else {
        alert('You need to select a deck first.')
    }    
}

function showPrices(){
    var totalPrice = 0
    deck.main.forEach(card => {
        totalPrice += (card.prices.cardmarket_price * card.amount)
    })
    console.log(totalPrice)
}

function openFile(){
    file = dialog.showOpenDialogSync({
        title: 'Select .ydk File',
        filters: [
            {name : 'Deck files', extensions: ['ydk']}
        ],
        properties: ['openFile']
    }).toString()
}

function debugButton(){
    console.log(deck)
    console.log(file)
}

ipcRenderer.on('db-updated', (event, arg) => {
    if(arg){
        var button =  document.getElementById('updateDB')
        button.innerText = 'Database updated'
        button.disabled = true
        setTimeout(() => {
            button.innerText = 'Update Database'
            button.disabled = false
        }, 5000)
    }
})

ipcRenderer.on('deck-parsed', (event, arg) => {
    deck = arg
    printDecklist(deck)
})

function printDecklist(deck){
    var mainDiv = document.getElementById('maindeck')
    var extraDiv = document.getElementById('extradeck')
    var sideDiv = document.getElementById('sidedeck')

    var mainHeading = document.getElementById('mainHeading')
    var extraHeading = document.getElementById('extraHeading')
    var sideHeading = document.getElementById('sideHeading')

    mainHeading.innerHTML = 'Main Deck (' + deck.mainAmount + " cards)"
    extraHeading.innerHTML = 'Extra Deck (' + deck.extraAmount + " cards)"
    sideHeading.innerHTML = 'Side Deck (' + deck.sideAmount + " cards)"

    var mainList = document.createElement('UL')
    var extraList = document.createElement('UL')
    var sideList = document.createElement('UL')

    mainDiv.appendChild(mainList)
    extraDiv.appendChild(extraList)
    sideDiv.appendChild(sideList)

    createList(deck.main,mainList)
    createList(deck.extra,extraList)
    createList(deck.side, sideList)
}

function createList(deck, listElement){
    deck.forEach(card => {
        var listItem = document.createElement('LI')
        listItem.innerHTML = card.amount + "x " + card.name
        listElement.appendChild(listItem)
    });
}