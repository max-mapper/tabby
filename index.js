var electron = require('electron')
var windows = require('./windows.js')
var setMenu = require('./appmenu.js')

electron.app.on('ready', function () {
  setMenu()
  windows.create()
})

electron.app.on('window-all-closed', windows.onAllClosed)
electron.app.on('activate', windows.onActivate)
