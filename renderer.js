var url = require('url')
var dns = require('dns')
var path = require('path')
var electron = require('electron')
var yo = require('yo-yo')
var load = require('rainbow-load')
var tld = require('tld')
tld.defaultFile = path.join(__dirname, 'tlds.dat')
var Menu = require('./menu.js')
var pkg = require('./package.json')

var errPage = path.join('file://', __dirname, '/error.html')
var newPage = path.join('file://', __dirname, '/newtab.html')

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
    if (!src) src = newPage
    var tab = yo`<webview src="${src}"></webview>`
    tabs.push(tab)
    showTab(tab)
    tab.addEventListener('did-start-loading', function () {
      var src = tab.getAttribute('src')
      console.log('did-start-loading', src)
      if (src === errPage) return true
      menu.input.value = src
      delete tab.__GOT_RESPONSE
      load.show()
      return true
    })
    tab.addEventListener('did-stop-loading', function () {
      var src = tab.getAttribute('src')
      console.log('did-stop-loading', src)
      if (src === errPage) return true
      menu.input.value = src
      load.hide()
      if (tab.__LOADFAIL) {
        console.error('Error loading', src)
        tab.setAttribute('src', errPage)
      }
      return true
    })
    tab.addEventListener('did-navigate-in-page', function (e) {
      tab.__LOADFAIL = false
      load.hide()
    })
    tab.addEventListener('did-get-response-details', function () {
      tab.__LOADFAIL = false
    })
    tab.addEventListener('page-title-updated', function (e) {
      electron.remote.getCurrentWindow().setTitle(e.title)
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
    if (tabs.length === 1) return electron.remote.getCurrentWindow().close()
    document.querySelector('.tabs').removeChild(tab)
    changeTab(-1)
    tabs.splice(idx, 1)
  }

  function initShortcuts () {
    electron.ipcRenderer.on('appmenu', function (event, type) {
      var tab = currentTab()
      if (type === 'file:new-tab') newTab()
      if (type === 'file:open-location') menu.toggle()
      if (type === 'file:close-tab') closeTab(tab)
      if (type === 'view:reload') tab.reload()
      if (type === 'view:hard-reload') tab.reloadIgnoringCache()
      if (type === 'history:back') tab.goBack()
      if (type === 'history:forward') tab.goForward()
      if (type === 'window:next-tab') changeTab(1)
      if (type === 'window:previous-tab') changeTab(-1)
      if (type === 'help:report-issue') newTab(pkg.bugs.url)
      if (type === 'help:learn-more') newTab(pkg.homepage)
    })
  }
}
