var yo = require('yo-yo')
var csjs = require('csjs-inject')
var vkey = require('vkey')
var Meny = require('./meny.js')

module.exports = function (onupdate) {
  var menuEl = document.querySelector('.menu')
  var contentsEl = document.querySelector('.tabs')
  var meny = createMenu(menuEl, contentsEl)
  var styles = csjs`.input {
    height: 25px;
    width: 100%;
    font-size: 14px;
    font-family: "Helvetica Neue";
    font-weight: 200;
    outline: none;
  }`
  var input = yo`<input class="${styles.input}" onkeydown=${onkeydown}></input>`
  menuEl.appendChild(input)

  function toggle () {
    if (meny.isOpen()) {
      meny.close()
      input.blur()
    } else {
      meny.open()
      input.focus()
      input.select()
    }
  }

  function onkeydown (e) {
    if (vkey[e.keyCode] === '<enter>') {
      onupdate(input.value)
      return toggle()
    }

    if (vkey[e.keyCode] === '<escape>') {
      return toggle()
    }
  }

  meny.toggle = toggle
  meny.input = input
  return meny
}

function createMenu (menu, contents) {
  return Meny.create({
    // The element that will be animated in from off screen
    menuElement: menu,

    // The contents that gets pushed aside while Meny is active
    contentsElement: contents,

    // The alignment of the menu (top/right/bottom/left)
    position: 'top',

    // The height of the menu (when using top/bottom position)
    height: 31,

    // The width of the menu (when using left/right position)
    width: 260,

    // The angle at which the contents will rotate to.
    angle: 30,

    // The mouse distance from menu position which can trigger menu to open.
    threshold: 40,

    // Width(in px) of the thin line you see on screen when menu is in closed position.
    overlap: 0,

    // The total time taken by menu animation.
    transitionDuration: '0.25s',

    // Transition style for menu animations
    transitionEasing: 'ease',

    // Gradient overlay for the contents
    gradient: 'rgba(0,0,0,0) 0%, rgba(0,0,0,0) 0%)',

    // Use mouse movement to automatically open/close
    mouse: false,

    // Use touch swipe events to open/close
    touch: false
  })
}
