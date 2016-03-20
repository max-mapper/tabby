var electron = require('electron')
var yo = require('yo-yo')
var load = require('rainbow-load') 
var vkey = require('vkey')
var Meny = require('./meny.js')

module.exports = function () {
  var tabs = []
  var meny = createMeny()
  initShortcuts()
  electron.ipcRenderer.on('new-tab', function (event, src) {
    newTab(src)
  })
  
  window.tabs = tabs
  window.showTab = showTab
  window.newTab = newTab
  
  function newTab (src) {
    var tab = yo`<webview src="${src}"></webview>`
    tabs.push(tab)
    showTab(tab)
    tab.addEventListener('did-start-loading', function () {
      load.show()
    })
    tab.addEventListener('did-stop-loading', function () {
      load.hide()
    })
    var content = document.querySelector('.tabs')
    content.appendChild(tab)
  }
  
  function showTab (tab) {
    var idx = tabs.indexOf(tab)
    if (idx === -1) return
    for (var i = 0; i < tabs.length; i++) {
      if (i === idx) tabs[i].setAttribute('style', 'display: block')
      else tabs[i].setAttribute('style', 'display: none')
    }
  }
  
  function initShortcuts () {
    document.body.addEventListener('keydown', function (ev) {
      if (vkey[ev.keyCode] === '`') meny.isOpen() ? meny.close() : meny.open()
    }, false)
  }
}

function createMeny () {
  return Meny.create({
    // The element that will be animated in from off screen
    menuElement: document.querySelector( '.menu' ),

    // The contents that gets pushed aside while Meny is active
    contentsElement: document.querySelector( '.tabs' ),

    // The alignment of the menu (top/right/bottom/left)
    position: 'top',

    // The height of the menu (when using top/bottom position)
    height: 100,

    // The width of the menu (when using left/right position)
    width: 260,

    // The angle at which the contents will rotate to.
    angle: 30,

    // The mouse distance from menu position which can trigger menu to open.
    threshold: 40,

    // Width(in px) of the thin line you see on screen when menu is in closed position.
    overlap: 6,

    // The total time taken by menu animation.
    transitionDuration: '0.25s',

    // Transition style for menu animations
    transitionEasing: 'ease',

    // Gradient overlay for the contents
    gradient: 'rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.65) 100%)',

    // Use mouse movement to automatically open/close
    mouse: true,

    // Use touch swipe events to open/close
    touch: true
  })
}