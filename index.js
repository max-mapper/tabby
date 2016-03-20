var electron = require('electron')

electron.app.on('ready', function() {
  var electronScreen = electron.screen
  var size = electronScreen.getPrimaryDisplay().workAreaSize 
  var win = new electron.BrowserWindow({width: size.width, height: size.height, fullscreen: true})
  win.loadURL('file://' + __dirname + '/index.html')  
  win.webContents.on('did-finish-load', function () {
    win.send('new-tab', 'http://maxogden.com')
  })
})