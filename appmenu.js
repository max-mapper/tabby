var electron = require('electron')
var Menu = electron.Menu
var app = electron.app
var windows = require('./windows')

var template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New Tab',
        accelerator: 'CmdOrCtrl+T',
        click: function (item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.send('appmenu', 'file:new-tab')
        }
      },
      {
        label: 'New Window',
        accelerator: 'CmdOrCtrl+N',
        click: function () { windows.create() }
      },
      {
        label: 'Reopen Closed Tab',
        accelerator: 'CmdOrCtrl+Shift+T',
        click: function (item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.send('appmenu', 'file:reopen-closed-tab')
        },
        enabled: false
      },
      {
        label: 'Open File',
        accelerator: 'CmdOrCtrl+O',
        click: function (item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.send('appmenu', 'file:open-file')
        },
        enabled: false
      },
      {
        label: 'Open Location',
        accelerator: 'CmdOrCtrl+L',
        click: function (item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.send('appmenu', 'file:open-location')
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Close Window',
        accelerator: 'CmdOrCtrl+Shift+W',
        click: function (item, focusedWindow) {
          if (focusedWindow) focusedWindow.close()
        }
      },
      {
        label: 'Close Tab',
        accelerator: 'CmdOrCtrl+W',
        click: function (item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.send('appmenu', 'file:close-tab')
        }
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: function (item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.send('view:reload')
        }
      },
      {
        label: 'Hard Reload (Clear Cache)',
        accelerator: 'CmdOrCtrl+Shift+R',
        click: function (item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.send('view:hard-reload')
        }
      },
      {
        label: 'Toggle Full Screen',
        accelerator: (function () {
          if (process.platform === 'darwin') return 'Ctrl+Command+F'
          return 'F11'
        })(),
        click: function (item, focusedWindow) {
          if (focusedWindow) focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: (function () {
          if (process.platform === 'darwin') return 'Alt+Command+I'
          return 'Ctrl+Shift+I'
        })(),
        click: function (item, focusedWindow) {
          if (focusedWindow) focusedWindow.toggleDevTools()
        }
      }
    ]
  },
  {
    label: 'History',
    role: 'history',
    submenu: [
      {
        label: 'Back',
        accelerator: 'CmdOrCtrl+Left',
        click: function (item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.send('appmenu', 'history:back')
        }
      },
      {
        label: 'Forward',
        accelerator: 'CmdOrCtrl+Right',
        click: function (item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.send('appmenu', 'history:forward')
        }
      }
    ]
  },
  {
    label: 'Window',
    role: 'window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        type: 'separator'
      },
      {
        label: 'Next Tab',
        accelerator: 'CmdOrCtrl+]',
        click: function (item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.send('appmenu', 'window:next-tab')
        }
      },
      {
        label: 'Previous Tab',
        accelerator: 'CmdOrCtrl+[',
        click: function (item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.send('appmenu', 'window:previous-tab')
        }
      }
    ]
  },
  {
    label: 'Help',
    role: 'help',
    submenu: [
      {
        label: 'Report an Issue...',
        click: function (item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.send('appmenu', 'help:report-issue')
        }
      },
      {
        label: 'Learn More',
        click: function (item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.send('appmenu', 'help:learn-more')
        }
      }
    ]
  }
]

if (process.platform === 'darwin') {
  var name = 'Tabby'
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About ' + name,
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        label: 'Services',
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        label: 'Hide ' + name,
        accelerator: 'Command+H',
        role: 'hide'
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Alt+H',
        role: 'hideothers'
      },
      {
        label: 'Show All',
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: function () { app.quit() }
      }
    ]
  })

  template.filter(function (el) {
    return el.label === 'Window'
  })[0].submenu.push(
    {
      type: 'separator'
    },
    {
      label: 'Bring All to Front',
      role: 'front'
    }
  )
}

module.exports = function () {
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}
