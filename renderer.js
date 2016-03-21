var electron = require('electron')
var remote = require('remote')
var yo = require('yo-yo')
var load = require('rainbow-load')
var vkey = require('vkey')
var url = require('url')
var Menu = require('./menu.js')

module.exports = function () {
  var menu = Menu(function onNewURL (href) {
    var parsed = url.parse(href)
    if (!parsed.protocol) href = 'http://' + href
    currentTab().setAttribute('src', href)
  })
  var tabs = []
  initShortcuts()
  newTab()

  window.tabs = tabs
  window.showTab = showTab
  window.newTab = newTab
  window.changeTab = changeTab

  function newTab (src) {
    if (!src) src = 'file://' + __dirname + '/newtab.html'
    var tab = yo`<webview src="${src}"></webview>`
    tabs.push(tab)
    showTab(tab)
    tab.addEventListener('did-start-loading', function () {
      load.show()
    })
    tab.addEventListener('did-stop-loading', function () {
      menu.input.value = tab.getAttribute('src')
      load.hide()
    })

    var content = document.querySelector('.tabs')
    content.appendChild(tab)
    electron.ipcRenderer.send('tab-change', tabs.length)
  }

  function currentTab () {
    for (var i = 0; i < tabs.length; i++) {
      if (tabs[i].getAttribute('style').match('block')) return tabs[i]
    }
  }

  function showTab (tab) {
    var idx = tabs.indexOf(tab)
    if (idx === -1) return
    for (var i = 0; i < tabs.length; i++) {
      if (i === idx) {
        tabs[i].setAttribute('style', 'display: block')
        menu.input.value = tabs[i].getAttribute('src')
      } else {
        tabs[i].setAttribute('style', 'display: none')
      }
    }
  }

  function changeTab (num) {
    for (var i = 0; i < tabs.length; i++) {
      if (tabs[i].getAttribute('style').match('block')) {
        var next = i + num
        if (next >= tabs.length) next = 0
        if (next === -1) next = tabs.length - 1
        var nextTab = tabs[next]
        if (!nextTab) return console.error('Tab change error', {num: num, next: next, tabs: tabs.length})
        return showTab(nextTab)
      }
    }
  }

  function closeTab (tab) {
    var idx = tabs.indexOf(tab)
    if (idx === -1) return
    if (tabs.length === 1) return electron.ipcRenderer.send('tab-change', 0)
    document.querySelector('.tabs').removeChild(tab)
    changeTab(-1)
    tabs.splice(idx, 1)
    electron.ipcRenderer.send('tab-change', tabs.length)
  }

  function initShortcuts () {
    window.addEventListener('keydown', handlekeydown, false)
    function handlekeydown (e) {
      var tab = currentTab()
      var k = vkey[e.keyCode]
      if (k === ']' && e.shiftKey && e.metaKey) changeTab(1)
      if (k === '[' && e.shiftKey && e.metaKey) changeTab(-1)
      if (k === 'R' && e.metaKey) {
        if (e.shiftKey) tab.reloadIgnoringCache()
        else tab.reload()
      }
      if (k === '<left>' && e.metaKey) tab.goBack()
      if (k === '<right>' && e.metaKey) tab.goForward()
      if (k === 'L' && e.metaKey) menu.toggle()
      if (k === 'T' && e.metaKey) newTab()
      if (k === 'W' && e.metaKey) closeTab(currentTab())
      if (k === 'Q' && e.metaKey) remote.getCurrentWindow().destroy()
    }
  }
}
