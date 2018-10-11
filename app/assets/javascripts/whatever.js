//Subscribe and Trigger are now methods of api 
// const api = WarpCable("wss://ec010beb.ngrok.io/cable")
const api = WarpCable("ws:localhost:3000/cable")
const TILE_SIZE = 64
let HISTORY_LIST = []
let currentlyDisplayedMove = null

document.addEventListener("turbolinks:load", function() {
	game_id = parseInt(document.URL.split("/games/")[1])

	// get gamestate so far
	api.trigger('Gamestates', 'full_game_state', {id: game_id}, data => {
		console.log("Got full game state up to now")
		HISTORY_LIST = data
		updateScreen(data)
	})

	// subscribe to state updates from now on
	api.subscribe('Gamestates', 'latest_game_state', {id: game_id}, data => {
		console.log("Got latest game state update from new move")
		addNewMove(data)
		updateScreen(HISTORY_LIST)
	})

	canvas.addEventListener('click', () => clickOnBoard(canvas, event), false);
	document.getElementById("pass_button").addEventListener('click', () => passTurn(), false);
});

function passTurn() {
	// send a move with no coordinates to represent a pass
	api.trigger('Gamestates', 'play', {id: game_id}, data => {
		console.log("Passed turn and got response")
		console.log(data)
	})
}

function addNewMove(data) {
	HISTORY_LIST.push(data)
}

function clickOnBoard(canvas, event) {
	clickedSquareIndices = getCursorPosition(canvas, event)
	console.log(clickedSquareIndices);

	game_id = parseInt(document.URL.split("/games/")[1])
	// send request to the server to play the move
	api.trigger('Gamestates', 'play', {id: game_id, x: clickedSquareIndices[0], y: clickedSquareIndices[1]}, data => {
		console.log("Played move and got response")
		updateErrorText(data)
	})
}

function getCursorPosition(canvas, event) {
	const x = event.pageX - canvas.offsetLeft,
				y = event.pageY - canvas.offsetTop;
	
	return [Math.floor(x / realTileSize(canvas)), Math.floor(y / realTileSize(canvas))];
}

function realTileSize(canvas) {
	return (canvas.offsetWidth / canvas.width) * TILE_SIZE
}