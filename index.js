var electron = require('electron')
var app = electron.app
var windows = require('./windows')
var appmenu = require('./appmenu')

app.on('ready', function () {
  appmenu()
  windows.create()
})

app.on('window-all-closed', windows.onAllClosed)
app.on('activate', windows.onActivate)
