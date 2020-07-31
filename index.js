const { ipcRenderer } = require('electron')
const { dialog } = require('electron').remote

let deck = {}
let file

document.getElementById('restoreButton').style.display = 'none'

function closeApp(){
    ipcRenderer.send('close-app')
}

function minimizeApp(){
    ipcRenderer.send('minimize-app')
}

function maximizeApp(){
    ipcRenderer.send('maximize-app')
}

ipcRenderer.on('window-maximize', (event, arg) => {
    var maximizeButton = document.getElementById('maximizeButton')
    var restoreButton = document.getElementById('restoreButton')

    if(arg){
        maximizeButton.style.display = 'none'
        restoreButton.style.display = 'inline-flex'
    } else {
        restoreButton.style.display = 'none'
        maximizeButton.style.display = 'inline-flex'
    }
    
})

function updateDatabase(){
    ipcRenderer.send('update-db')
}

function showPrices(){
    var totalPrice = calcPrice(deck.main) + calcPrice(deck.extra) + calcPrice(deck.side)
    document.getElementById('totalPrice').innerText = "TOTAL PRICE: " + totalPrice.toPrecision(2)
}

function calcPrice(decklist){
    var total = 0
    decklist.forEach(card => {
        total += (card.prices.cardmarket_price * card.amount)
    })
    return total
}

function openFile(){
    file = dialog.showOpenDialogSync({
        title: 'Select .ydk File',
        filters: [
            {name : 'Deck files', extensions: ['ydk']}
        ],
        properties: ['openFile']
    }).toString()
    ipcRenderer.send('parse-deck', file)
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