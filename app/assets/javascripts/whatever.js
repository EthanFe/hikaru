//Subscribe and Trigger are now methods of api 
// const api = WarpCable("wss://e600e2e3.ngrok.io/cable")
const api = WarpCable("ws:localhost:3000/cable")
const TILE_SIZE = 64
let HISTORY_LIST = []
let currentlyDisplayedMove = null
let game_status = null

document.addEventListener("turbolinks:load", function() {
	game_id = parseInt(document.URL.split("/games/")[1])

	// get gamestate so far
	api.trigger('Gamestates', 'full_game_state', {id: game_id}, data => {
		if (data.game_status == "scoring") {
			beginScoring(data.players_finished_scoring)
		} else {
			// pretty janky to have the above line and also this but gotta actually set this so people can play moves
			game_status = data.game_status
		}
		console.log("Got full game state up to now")
		HISTORY_LIST = data.history
		updateScreen(HISTORY_LIST, null, data.groups, data.score)
	})

	// subscribe to state updates from now on
	api.subscribe('Gamestates', 'latest_game_state', {id: game_id}, data => {
		console.log("Got latest game state update from new move")
		addNewMove(data)
		updateScreen(HISTORY_LIST)
	})

	// subscribe to endgame group aliveness updates
	api.subscribe('Gamestates', 'latest_endgame_state', {id: game_id}, data => {
		console.log("Got group aliveness update")
		beginScoring(data.players_finished_scoring)
		updateScreen(HISTORY_LIST, null, data.groups, data.score)
	})

	canvas.addEventListener('click', () => clickOnBoard(canvas, event), false);
	document.getElementById("pass_button").addEventListener('click', () => passTurn(), false);
	document.getElementById("finish_scoring_button").addEventListener('click', () => finishScoring(), false);
});

function beginScoring(players_finished_scoring) {
	game_status = "scoring"
	document.getElementById("pass_button").classList.add("invisible")
	document.getElementById("scoring").classList.remove("invisible")
	document.getElementById("player1_finished_scoring").textContent = `Player 1${players_finished_scoring[0] ? "" : " not"} finished`
	document.getElementById("player2_finished_scoring").textContent = `Player 2${players_finished_scoring[1] ? "" : " not"} finished`
}

function addNewMove(data) {
	HISTORY_LIST.push(data)
}

function getCursorPosition(canvas, event) {
	const x = event.pageX - canvas.offsetLeft,
				y = event.pageY - canvas.offsetTop;
	
	return [Math.floor(x / realTileSize(canvas)), Math.floor(y / realTileSize(canvas))];
}

function realTileSize(canvas) {
	return (canvas.offsetWidth / canvas.width) * TILE_SIZE
}