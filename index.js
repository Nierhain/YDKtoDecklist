const { ipcRenderer } = require('electron')

function updateDatabase(){
    ipcRenderer.send('update-db')
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

function ydk(){
    ipcRenderer.send('ydk')
}