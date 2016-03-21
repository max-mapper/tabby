var url = require('url')
var dns = require('dns')
var electron = require('electron')
var remote = require('remote')
var yo = require('yo-yo')
var load = require('rainbow-load')
var vkey = require('vkey')
var tld = require('tld')
tld.defaultFile = __dirname + '/tlds.dat'
var Menu = require('./menu.js')

var errPage = 'file://' + __dirname + '/error.html'

module.exports = function () {
  var menu = Menu(function onNewURL (href) {
    var original = href
    var tab = currentTab()
    if (href.indexOf(' ') > -1) return search(original)
    var parsed = url.parse(href)
    if (!parsed.protocol) {
      href = 'http://' + href
      parsed = url.parse(href)
    }
    var validTld = tld.registered(parsed.hostname)
    if (validTld && href.indexOf('.') > -1) return tab.setAttribute('src', href)

    var queryFinished = false
    setTimeout(function () {
      if (queryFinished) return
      queryFinished = true
      search(original)
    }, 250)
    
    dns.lookup(parsed.hostname, function (err, address) {
      console.log('dns', err, address)
      if (queryFinished) return
      queryFinished = true
      if (err) return search(original)
      else tab.setAttribute('src', href)
    })
    
    function search (href) {
      href = 'https://duckduckgo.com/?q=' + href.split(' ').join('+')
      return tab.setAttribute('src', href)
    }
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
      if (tab.getAttribute('src') === errPage) return
      delete tab.__GOT_RESPONSE
      load.show()
    })
    tab.addEventListener('did-stop-loading', function () {
      if (tab.getAttribute('src') === errPage) return
      menu.input.value = tab.getAttribute('src')
      load.hide()
      if (!tab.__GOT_RESPONSE) {
        tab.setAttribute('src', errPage)
        console.error('Error loading')
      }
    })
    tab.addEventListener('did-get-response-details', function () {
      tab.__GOT_RESPONSE = true
    })

    var content = document.querySelector('.tabs')
    content.appendChild(tab)
    electron.ipcRenderer.send('tab-change', tabs.length)
  }

  function currentTab () {
    for (var i = 0; i < tabs.length; i++) {
      if (tabs[i].getAttribute('style').match('flex')) return tabs[i]
    }
  }

  function showTab (tab) {
    var idx = tabs.indexOf(tab)
    if (idx === -1) return
    for (var i = 0; i < tabs.length; i++) {
      if (i === idx) {
        tabs[i].setAttribute('style', 'display: flex')
        menu.input.value = tabs[i].getAttribute('src')
      } else {
        tabs[i].setAttribute('style', 'display: none')
      }
    }
  }

  function changeTab (num) {
    for (var i = 0; i < tabs.length; i++) {
      if (tabs[i].getAttribute('style').match('flex')) {
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
