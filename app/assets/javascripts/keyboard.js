// code for scrolling around history with arrow keys
var keyMap = {
	39: 'right',
	37: 'left',
	38: 'up',
	40: 'down'
}

function keydown() {
	console.log("keydown")
	var key = keyMap[event.keyCode]
	if (key == 'right' && HISTORY_LIST.length > currentlyDisplayedMove + 1) {
		displayStateFromMove(currentlyDisplayedMove + 1)
	} else if (key == 'left' && currentlyDisplayedMove > 0) {
		displayStateFromMove(currentlyDisplayedMove - 1)
	}
}

window.addEventListener("keydown", keydown, false)