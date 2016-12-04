var remote = require('electron').remote
var Menu = remote.Menu
var MenuItem = remote.MenuItem

var tabs = window.tabs

function goBack () {
  var tab = currentTab()
  tab.goBack()
}
function reloadPage () {
  var tab = currentTab()
  tab.reload()
}
//function viewSource () {}
//function savePage () {}
//function printPage () {}
//function inspectElement () {}

function currentTab () {
  for (var i = 0; i < tabs.length; i++) {
    if (tabs[i].getAttribute('style').match('flex')) return tabs[i]
  }
}

var menu = new Menu()
menu.append(new MenuItem({ label: 'Back', click: goBack }))
menu.append(new MenuItem({ label: 'Reload Page', click: reloadPage }))
//menu.append(new MenuItem({ type: 'separator' }))
//menu.append(new MenuItem({ label: 'Show Page Source', click: viewSource }))
//menu.append(new MenuItem({ label: 'Save Page As', click: savePage }))
//menu.append(new MenuItem({ label: 'Print Page', click: printPage }))
//menu.append(new MenuItem({ type: 'separator' }))
//menu.append(new MenuItem({ label: 'Inspect Element', click: inspectElement}))

window.addEventListener('contextmenu', function (e) {
  e.preventDefault()
  menu.popup(remote.getCurrentWindow())
}, false)
