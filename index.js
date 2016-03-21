var electron = require('electron')

electron.app.on('ready', function () {
  electron.app.on('window-all-closed', function () {
    electron.app.quit()
  })
  var electronScreen = electron.screen
  var size = electronScreen.getPrimaryDisplay().workAreaSize
  var win = new electron.BrowserWindow({width: size.width, height: size.height, fullscreen: true})
  win.loadURL('file://' + __dirname + '/index.html')
  var canClose = true
  win.on('close', function (e) {
    if (!canClose) e.preventDefault()
  })
  electron.ipcMain.on('tab-change', function (event, tabCount) {
    if (tabCount === 0) {
      canClose = true
      win.close()
    } else if (tabCount < 0) {
      win.close()
    } else {
      canClose = false
    }
  })
})

function log (m) {
  require('fs').appendFileSync('/Users/max/Desktop/applog.txt', m + '\n')
}