var electron = require('electron')
var path = require('path')
var app = electron.app
var windows = []

module.exports = {
  create: create,
  destroy: destroy,
  onActivate: onActivate,
  onAllClosed: onAllClosed
}

function create () {
  var electronScreen = electron.screen
  var size = electronScreen.getPrimaryDisplay().workAreaSize
  var win = new electron.BrowserWindow({
    width: size.width,
    height: size.height,
    title: 'Tabby'
  })
  win.loadURL(path.join('file://', __dirname, 'index.html'))
  win.on('closed', function () { destroy(win) })
  windows.push(win)
}

function destroy (win) {
  var i = windows.indexOf(win)
  if (i > -1) windows.splice(i, 1)
  win = null
}

function onAllClosed () {
  if (process.platform !== 'darwin') app.quit()
}

function onActivate () {
  if (!windows.length) create()
}
