function passTurn() {
	// send a move with no coordinates to represent a pass
	api.trigger('Gamestates', 'play', {id: game_id}, data => {
		console.log("Passed turn and got response")
		console.log(data)
	})
}

function clickOnBoard(canvas, event) {
	clickedSquareIndices = getCursorPosition(canvas, event)
	console.log(clickedSquareIndices);

	game_id = parseInt(document.URL.split("/games/")[1])

	if (game_status == "scoring") {
		api.trigger('Gamestates', 'toggle_aliveness', {id: game_id, x: clickedSquareIndices[0], y: clickedSquareIndices[1]}, data => {
			console.log("Toggled aliveness of group to " + data)
		})
	} else if (game_status == "active") {
		// send request to the server to play the move
		api.trigger('Gamestates', 'play', {id: game_id, x: clickedSquareIndices[0], y: clickedSquareIndices[1]}, data => {
			console.log("Played move and got response")
			updateErrorText(data)
		})
  }
  // otherwise game is complete so clickies are illegal
}

function finishScoring() {
	console.log("done scoring")
	api.trigger('Gamestates', 'finish_scoring', {id: game_id}, data => {
		console.log("Pressed finish scoring burron and got response")
		console.log(data)
	})
}